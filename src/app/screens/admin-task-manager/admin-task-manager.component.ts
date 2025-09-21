import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TaskDTO, TaskStatus } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task_service';
import { AssistanceService } from 'src/app/services/assistance_service';
import { UserService } from 'src/app/services/user_service';
import { EmployeeWithShift } from 'src/app/models/user';

type ShiftLite = { id: string; name: string; start: string; end: string };

@Component({
  selector: 'app-admin-task-manager',
  templateUrl: './admin-task-manager.component.html',
  styleUrls: ['./admin-task-manager.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTaskManagerComponent implements OnInit {

  @Input() currentAdminUid!: string;
  @Input() currentAdminName!: string;

  // (lo pasás desde Workday; acá no lo usamos mucho)
  @Input() shift: ShiftLite | null = null;

  form!: FormGroup;

  creating = false;
  loadingTasks = false;

  // empleados reales (sin admins)
  loadingEmployees = false;
  loadEmployeesError: string | null = null;
  employees: EmployeeWithShift[] = [];

  // selección actual
  selectedEmployeeId: string | null = null;
  selectedEmployeeName: string | null = null;
  selectedShiftId: string | null = null;
  selectedShiftName: string = '—';

  // datos
  statusOptions: TaskStatus[] = ['assigned', 'in_progress', 'done'];
  recentTasks: TaskDTO[] = [];
  tasksForSelected: TaskDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private tasks: TaskService,
    private assistance: AssistanceService,
    private users: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title:        ['', [Validators.required, Validators.minLength(1)]],
      description:  ['', [Validators.required, Validators.minLength(1)]],
      start_at_local: [''],
      due_at_local:   [''],
      tag:          [''],
      // lo marcamos required para asegurarnos que se elija alguien
      assignee_uid: ['', [Validators.required]],
    });

    this.loadEmployees();
  }

  get f() { return this.form.controls; }

  // =========================
  // Employees (reales) + shift
  // =========================
  async loadEmployees(): Promise<void> {
    this.loadingEmployees = true;
    this.loadEmployeesError = null;
    this.cdr.markForCheck();
    try {
      const list = await firstValueFrom(this.users.listEmployeesWithShift());
      this.employees = list;
    } catch (e: any) {
      console.error('[ADMIN] load employees error', e);
      this.employees = [];
      this.loadEmployeesError = (e?.error?.detail || e?.message || 'Failed to load employees');
    } finally {
      this.loadingEmployees = false;
      this.cdr.markForCheck();
    }
  }

  async onEmployeeChange(uid: string): Promise<void> {
    // reflejamos selección
    this.selectedEmployeeId = uid;

    const emp = this.employees.find(e => e.uid === uid) || null;
    this.selectedEmployeeName = emp?.name || uid;

    // seteo turno desde lo que ya trajo /users/employees-with-shift
    const shift = emp?.shift ?? null;
    this.selectedShiftId = shift?.id != null ? String(shift.id as any) : null;
    this.selectedShiftName = shift?.name || '—';

    // fallback: si no hay id de turno, uso current shift del día
    if (!this.selectedShiftId) {
      try {
        const cur: any = await firstValueFrom(this.assistance.getCurrentShiftId());
        this.selectedShiftId = cur?.shift_id ?? null;
      } catch {
        this.selectedShiftId = null;
      }
    }

    await this.refreshTasksList();
    this.cdr.markForCheck();
  }

  // =========================
  // Tasks list + status change
  // =========================
  async refreshTasksList(): Promise<void> {
    if (!this.selectedEmployeeId) { this.tasksForSelected = []; return; }
    this.loadingTasks = true;
    this.cdr.markForCheck();
    try {
      const list$ = this.tasks.getTasksForEmployeeDTO(
        this.selectedEmployeeId,
        this.selectedShiftId || undefined
      );
      this.tasksForSelected = await firstValueFrom(list$) || [];
    } catch (e) {
      console.error('[ADMIN] load tasks error', e);
      this.tasksForSelected = [];
    } finally {
      this.loadingTasks = false;
      this.cdr.markForCheck();
    }
  }

  async onStatusChange(row: TaskDTO, newStatus: TaskStatus): Promise<void> {
    if (!this.selectedEmployeeId) return;
    const shiftId = this.selectedShiftId || (row as any).id_shift || 'UNASSIGNED';
    try {
      await firstValueFrom(this.tasks.updateEmbeddedTaskStatus({
        employeeId: this.selectedEmployeeId,
        shiftId,
        taskId: row.id,
        status: newStatus,
      }));
      row.status = newStatus;
      await this.refreshTasksList();
    } catch (e) {
      console.error('[ADMIN] update status error', e);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // =========================
  // Create + Assign (submit del form)
  // =========================
  async createAndAssign(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const uid = this.f['assignee_uid'].value as string;
    await this.onEmployeeChange(uid); // asegura shift seleccionado

    this.creating = true;
    this.cdr.markForCheck();

    const title = (this.f['title'].value || '').trim();
    const description = (this.f['description'].value || '').trim();
    const tag = (this.f['tag'].value || '').trim() || undefined;
    const start_local = this.f['start_at_local'].value as string | '';
    const due_local   = this.f['due_at_local'].value as string | '';

    const start_at_iso = start_local ? this.localToIso(start_local) : undefined;
    const due_at_iso   = due_local ? this.localToIso(due_local)   : undefined;

    try {
      // si (por lo que sea) no tengo shift id, traigo current
      if (!this.selectedShiftId) {
        const cur: any = await firstValueFrom(this.assistance.getCurrentShiftId());
        this.selectedShiftId = cur?.shift_id ?? 'UNASSIGNED';
      }

      const resp = await firstValueFrom(this.tasks.createAndAttachTask({
        employeeId: uid,
        shiftId: this.selectedShiftId || 'UNASSIGNED',
        dto: { title, description, status: 'assigned', tag, start_at: start_at_iso, due_at: due_at_iso },
      }));

      const newId = (resp as any)?.id as string | undefined;

      // cache local
      const row: TaskDTO = {
        id: newId || (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
        title, description, tag,
        status: 'assigned',
        assignee_uid: uid,
        assignee_name: this.selectedEmployeeName || uid,
        shift_window: (start_at_iso || due_at_iso) ? { start: start_at_iso || '', end: due_at_iso || '' } : undefined,
        ...(this.selectedShiftId ? { id_shift: this.selectedShiftId } as any : {}),
      } as any;

      this.recentTasks = [row, ...this.recentTasks];
      await this.refreshTasksList();

      // reseteo campos de contenido, dejo el empleado
      const assignee_uid = this.f['assignee_uid'].value;
      this.form.reset({ assignee_uid });
    } catch (e) {
      console.error('[ADMIN] create+assign error', e);
    } finally {
      this.creating = false;
      this.cdr.markForCheck();
    }
  }

  // ===== Preview getters =====
  get previewTitle(): string {
    return (this.f?.['title']?.value || '').trim() || 'Untitled task';
  }
  get previewDescription(): string {
    return (this.f?.['description']?.value || '').trim() || '—';
  }
  get previewTag(): string | null {
    const t = (this.f?.['tag']?.value || '').trim();
    return t ? t : null;
  }
  get previewWindow(): { start?: string; end?: string } | null {
    const s = this.f?.['start_at_local']?.value as string | '';
    const d = this.f?.['due_at_local']?.value as string | '';
    if (!s && !d) return null;
    return { start: s || undefined, end: d || undefined };
  }

  // ===== utils =====
  private localToIso(local: string): string {
    const d = new Date(local);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }
}
