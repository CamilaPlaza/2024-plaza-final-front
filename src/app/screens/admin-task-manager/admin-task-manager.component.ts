import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TaskDTO, TaskStatus } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task_service';
import { AssistanceService } from 'src/app/services/assistance_service';

type EmployeeOpt = { uid: string; name: string; shiftLabel?: string };
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

  // 🔧 agregado para que Workday pueda pasar el turno sin romper (aunque el admin no lo use)
  @Input() shift: ShiftLite | null = null;
  get adminShiftLabel(): string {
    return this.shift ? `${this.shift.start}–${this.shift.end}` : '—';
  }

  form!: FormGroup;
  creating = false;
  loadingTasks = false;

  // listado de empleados (mock por ahora)
  employees: EmployeeOpt[] = [
    { uid: 'emp_001', name: 'Juan Pérez' },
    { uid: 'emp_002', name: 'Ana García' },
    { uid: 'emp_003', name: 'Luis Romero' },
  ];

  selectedEmployeeId: string | null = null;
  selectedEmployeeName: string | null = null;
  selectedShiftId: string | null = null;
  selectedEmployeeShiftLabel: string = '—';

  statusOptions: TaskStatus[] = ['assigned', 'in_progress', 'done'];
  recentTasks: TaskDTO[] = [];
  tasksForSelected: TaskDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private tasks: TaskService,
    private assistance: AssistanceService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      tag: [''],
      assignee_uid: ['', [Validators.required]],
      start_at_local: [''],
      due_at_local: [''],
    });
  }

  get f() { return this.form.controls; }

  async onEmployeeChange(uid: string): Promise<void> {
    this.selectedEmployeeId = uid;
    const emp = this.employees.find(e => e.uid === uid);
    this.selectedEmployeeName = emp?.name || uid;
    this.selectedShiftId = null;
    this.selectedEmployeeShiftLabel = '—';

    try {
      const s: any = await firstValueFrom(this.assistance.getAssignedShiftForEmployee(uid));
      const start = s?.start_time ? this.formatHHMM(s.start_time) : '—';
      const end   = s?.end_time ? this.formatHHMM(s.end_time) : '—';
      const idShift = s?.id ?? null;

      const i = this.employees.findIndex(e => e.uid === uid);
      if (i > -1) this.employees[i] = { ...this.employees[i], shiftLabel: `${start}–${end}` };

      this.selectedShiftId = idShift;
      this.selectedEmployeeShiftLabel = `${start}–${end}`;

      if (!this.selectedShiftId) {
        const cur: any = await firstValueFrom(this.assistance.getCurrentShiftId());
        this.selectedShiftId = cur?.shift_id ?? null;
      }
    } catch {
      try {
        const cur: any = await firstValueFrom(this.assistance.getCurrentShiftId());
        this.selectedShiftId = cur?.shift_id ?? null;
      } catch { this.selectedShiftId = null; }
    }

    await this.refreshTasksList();
    this.cdr.markForCheck();
  }

  async refreshTasksList(): Promise<void> {
    if (!this.selectedEmployeeId) { this.tasksForSelected = []; return; }
    this.loadingTasks = true;
    this.cdr.markForCheck();
    try {
      const list$ = this.tasks.getTasksForEmployeeDTO(this.selectedEmployeeId, this.selectedShiftId || undefined);
      this.tasksForSelected = await firstValueFrom(list$) || [];
    } catch (e) {
      console.error('[ADMIN] load tasks error', e);
      this.tasksForSelected = [];
    } finally {
      this.loadingTasks = false;
      this.cdr.markForCheck();
    }
  }

  async createAndAssign(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.selectedEmployeeId) return;

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
      const resp = await firstValueFrom(this.tasks.createAndAttachTask({
        employeeId: this.selectedEmployeeId,
        shiftId: this.selectedShiftId || 'UNASSIGNED',
        dto: { title, description, status: 'assigned', tag, start_at: start_at_iso, due_at: due_at_iso },
      }));

      const newId = (resp as any)?.id as string | undefined;

      const row: TaskDTO = {
        id: newId || (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
        title, description, tag,
        status: 'assigned',
        assignee_uid: this.selectedEmployeeId,
        assignee_name: this.selectedEmployeeName || this.selectedEmployeeId,
        shift_window: (start_at_iso || due_at_iso) ? { start: start_at_iso || '', end: due_at_iso || '' } : undefined,
        id_shift: this.selectedShiftId || undefined,
      };
      this.recentTasks = [row, ...this.recentTasks];

      await this.refreshTasksList();

      const assignee_uid = this.f['assignee_uid'].value;
      this.form.reset({ assignee_uid });
    } catch (e) {
      console.error('[ADMIN] create+assign error', e);
    } finally {
      this.creating = false;
      this.cdr.markForCheck();
    }
  }

  async onStatusChange(row: TaskDTO, newStatus: TaskStatus): Promise<void> {
    if (!this.selectedEmployeeId) return;
    const shiftId = row.id_shift || this.selectedShiftId || 'UNASSIGNED';
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

  // ===== helpers =====
  private formatHHMM(iso: string): string {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  private localToIso(local: string): string {
    const d = new Date(local);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }
}
