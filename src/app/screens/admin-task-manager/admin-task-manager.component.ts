import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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
  @Input() shift: ShiftLite | null = null;

  form!: FormGroup;

  creating = false;
  loadingTasks = false;

  loadingEmployees = false;
  loadEmployeesError: string | null = null;
  employees: EmployeeWithShift[] = [];

  selectedEmployeeId: string | null = null;
  selectedEmployeeName: string | null = null;
  selectedShiftId: string | null = null;
  selectedShiftName: string = '—';

  statusOptions: TaskStatus[] = ['assigned', 'in_progress', 'done'];
  recentTasks: TaskDTO[] = [];
  tasksForSelected: TaskDTO[] = [];

  // límites de fecha para los inputs
  minStartLocal = this.toLocalInput(new Date());
  get minDueLocal(): string {
    // due no puede ser antes que start; si no hay start: al menos ahora
    const s = this.f?.['start_at_local']?.value as string | '';
    return s || this.minStartLocal;
  }

  constructor(
    private fb: FormBuilder,
    private tasks: TaskService,
    private assistance: AssistanceService,
    private users: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        title: ['', [Validators.required, Validators.minLength(1)]],
        description: ['', [Validators.required, Validators.minLength(1)]],
        start_at_local: [''],
        due_at_local: [''],
        tag: [''],
        assignee_uid: ['', [Validators.required]],
      },
      { validators: this.dateWindowValidator }
    );

    // actualizo validaciones cuando cambian fechas
    this.f['start_at_local'].valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      this.cdr.markForCheck();
    });
    this.f['due_at_local'].valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      this.cdr.markForCheck();
    });

    this.loadEmployees();
  }

  get f() {
    return this.form.controls;
  }

  // ====== employees reales con turno ======
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
      this.loadEmployeesError =
        e?.error?.detail || e?.message || 'Failed to load employees';
    } finally {
      this.loadingEmployees = false;
      this.cdr.markForCheck();
    }
  }

  async onEmployeeChange(uid: string): Promise<void> {
    this.selectedEmployeeId = uid;

    const emp = this.employees.find((e) => e.uid === uid) || null;
    this.selectedEmployeeName = emp?.name || uid;

    const shift = emp?.shift ?? null;
    this.selectedShiftId = shift?.id != null ? String(shift.id as any) : null;
    this.selectedShiftName = shift?.name || '—';

    if (!this.selectedShiftId) {
      try {
        const cur: any = await firstValueFrom(
          this.assistance.getCurrentShiftId()
        );
        this.selectedShiftId = cur?.shift_id ?? null;
      } catch {
        this.selectedShiftId = null;
      }
    }

    await this.refreshTasksList();
    this.cdr.markForCheck();
  }

  // ====== list + status ======
  async refreshTasksList(): Promise<void> {
    if (!this.selectedEmployeeId) {
      this.tasksForSelected = [];
      return;
    }
    this.loadingTasks = true;
    this.cdr.markForCheck();
    try {
      const list$ = this.tasks.getTasksForEmployeeDTO(
        this.selectedEmployeeId,
        this.selectedShiftId || undefined
      );
      this.tasksForSelected = (await firstValueFrom(list$)) || [];
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
      this.loadingTasks = true;
      this.cdr.markForCheck();
      await firstValueFrom(
        this.tasks.updateEmbeddedTaskStatus({
          employeeId: this.selectedEmployeeId,
          shiftId,
          taskId: row.id,
          status: newStatus,
        })
      );
      row.status = newStatus;
      await this.refreshTasksList();
    } catch (e) {
      console.error('[ADMIN] update status error', e);
    } finally {
      this.loadingTasks = false;
      this.cdr.markForCheck();
    }
  }

  // ====== create + assign ======
  async createAndAssign(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const uid = this.f['assignee_uid'].value as string;
    if (!uid) return;

    await this.onEmployeeChange(uid); // asegura shift

    this.creating = true;
    this.cdr.markForCheck();

    const title = (this.f['title'].value || '').trim();
    const description = (this.f['description'].value || '').trim();
    const tag = (this.f['tag'].value || '').trim() || undefined;
    const start_local = (this.f['start_at_local'].value as string) || '';
    const due_local = (this.f['due_at_local'].value as string) || '';

    const start_at_iso = start_local ? this.localToIso(start_local) : undefined;
    const due_at_iso = due_local ? this.localToIso(due_local) : undefined;

    try {
      if (!this.selectedShiftId) {
        const cur: any = await firstValueFrom(this.assistance.getCurrentShiftId());
        this.selectedShiftId = cur?.shift_id ?? 'UNASSIGNED';
      }

      const resp = await firstValueFrom(
        this.tasks.createAndAttachTask({
          employeeId: uid,
          shiftId: this.selectedShiftId || 'UNASSIGNED',
          dto: {
            title,
            description,
            status: 'assigned',
            tag,
            start_at: start_at_iso,
            due_at: due_at_iso,
          },
        })
      );

      const newId = (resp as any)?.id as string | undefined;

      const row: TaskDTO = {
        id: newId || (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
        title,
        description,
        tag,
        status: 'assigned',
        assignee_uid: uid,
        assignee_name: this.selectedEmployeeName || uid,
        shift_window:
          start_at_iso || due_at_iso
            ? { start: start_at_iso || '', end: due_at_iso || '' }
            : undefined,
        ...(this.selectedShiftId ? ({ id_shift: this.selectedShiftId } as any) : {}),
      } as any;

      this.recentTasks = [row, ...this.recentTasks];

      await this.refreshTasksList();

      // reseteo contenido pero dejo el empleado
      const assignee_uid = this.f['assignee_uid'].value;
      this.form.reset({ assignee_uid });
    } catch (e) {
      console.error('[ADMIN] create+assign error', e);
    } finally {
      this.creating = false;
      this.cdr.markForCheck();
    }
  }

  // ===== preview getters =====
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

  // ====== helpers de fecha ======
  private dateWindowValidator = (group: AbstractControl): ValidationErrors | null => {
    const s = group.get('start_at_local')?.value as string | '';
    const d = group.get('due_at_local')?.value as string | '';
    const now = new Date();

    if (s) {
      const sd = new Date(s);
      if (!isNaN(sd.getTime()) && sd.getTime() < now.getTime() - 60 * 1000) {
        return { startPast: true };
      }
    }

    if (s && d) {
      const sd = new Date(s);
      const dd = new Date(d);
      if (!isNaN(sd.getTime()) && !isNaN(dd.getTime()) && dd.getTime() < sd.getTime()) {
        return { dueBeforeStart: true };
      }
    }

    return null;
  };

  private toLocalInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  private localToIso(local: string): string {
    const d = new Date(local);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }
}
