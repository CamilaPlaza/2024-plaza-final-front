import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TaskDTO, TaskStatus } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task_service';

type ShiftLite = { id: string; name: string; start: string; end: string };

@Component({
  selector: 'app-employee-task-board',
  templateUrl: './employee-task-board.component.html',
  styleUrls: ['./employee-task-board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeTaskBoardComponent implements OnInit, OnChanges {
  @Input() employeeUid!: string;
  @Input() employeeName!: string;
  @Input() shift!: ShiftLite | null;
  @Input() attendanceOpen = false;

  loading = false;
  saving = false;
  errorMsg: string | null = null;

  assigned: TaskDTO[] = [];
  in_progress: TaskDTO[] = [];
  done: TaskDTO[] = [];

  dragging: TaskDTO | null = null;
  dragOverCol: TaskStatus | null = null;

  constructor(
    private tasks: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.load(); }
  ngOnChanges(ch: SimpleChanges): void {
    if (ch['employeeUid'] || ch['shift']) this.load();
  }

  get shiftIdForQuery(): string | undefined {
    const sid = this.shift?.id;
    if (!sid || sid === 'UNASSIGNED') return undefined;
    return String(sid);
  }

  async load(): Promise<void> {
    if (!this.employeeUid) return;
    this.loading = true; this.errorMsg = null; this.cdr.markForCheck();
    try {
      const list$ = this.tasks.getTasksForEmployeeDTO(this.employeeUid, this.shiftIdForQuery);
      const items = (await firstValueFrom(list$)) || [];
      this.splitIntoColumns(items);
    } catch (e: any) {
      console.error('[EMP] load tasks error', e);
      this.assigned = this.in_progress = this.done = [];
      this.errorMsg = e?.error?.detail || e?.message || 'Failed to load tasks';
    } finally {
      this.loading = false; this.cdr.markForCheck();
    }
  }

  private splitIntoColumns(items: TaskDTO[]): void {
    this.assigned    = items.filter(t => t.status === 'assigned');
    this.in_progress = items.filter(t => t.status === 'in_progress');
    this.done        = items.filter(t => t.status === 'done');
  }

  // ===== Drag & Drop (desktop) =====
  onDragStart(task: TaskDTO): void { if (this.attendanceOpen) this.dragging = task; }
  onDragEnd(): void { this.dragging = null; this.dragOverCol = null; }
  allowDrop(ev: DragEvent, col: TaskStatus): void {
    if (!this.attendanceOpen) return;
    ev.preventDefault(); this.dragOverCol = col;
  }
  async onDrop(ev: DragEvent, target: TaskStatus): Promise<void> {
    if (!this.attendanceOpen || !this.dragging) return;
    ev.preventDefault();
    const task = this.dragging;
    if (task.status !== target) await this.updateStatus(task, target);
    this.onDragEnd();
  }

  // ===== Mobile segmented control =====
  async setStatusFromMobile(task: TaskDTO, target: TaskStatus): Promise<void> {
    if (!this.attendanceOpen || task.status === target) return;
    await this.updateStatus(task, target);
  }

  private async updateStatus(task: TaskDTO, newStatus: TaskStatus): Promise<void> {
    const shiftId = (task as any).id_shift || this.shift?.id || 'UNASSIGNED';
    this.saving = true; this.cdr.markForCheck();
    try {
      await firstValueFrom(
        this.tasks.updateEmbeddedTaskStatus({
          employeeId: this.employeeUid,
          shiftId: String(shiftId),
          taskId: task.id,
          status: newStatus,
        })
      );
      task.status = newStatus;
      this.removeFromAll(task.id);
      this.pushIntoColumn(task, newStatus);
    } catch (e) {
      console.error('[EMP] update status error', e);
    } finally {
      this.saving = false; this.cdr.markForCheck();
    }
  }

  private removeFromAll(taskId: string): void {
    const rm = (arr: TaskDTO[]) => { const i = arr.findIndex(t => t.id === taskId); if (i > -1) arr.splice(i, 1); };
    rm(this.assigned); rm(this.in_progress); rm(this.done);
  }
  private pushIntoColumn(task: TaskDTO, col: TaskStatus): void { (this as any)[col].unshift(task); }

  // ===== helpers UI =====
  trackById(_i: number, t: TaskDTO) { return t.id; }

  formatFull(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleString([], {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
  }

  // Meta de vencimiento: texto + clase visual
  deadlineMeta(t: TaskDTO): { label: string; cls: 'ok'|'warn'|'over'|'none' } {
    const endIso = t.shift_window?.end || '';
    if (!endIso) return { label: 'Sin vencimiento', cls: 'none' };

    const end = new Date(endIso).getTime();
    if (isNaN(end)) return { label: 'Sin vencimiento', cls: 'none' };

    const now = Date.now();
    const diffMs = end - now;

    const msDay = 24 * 60 * 60 * 1000;
    // redondeo hacia arriba para contar medios días como 1 día
    const absDays = Math.ceil(Math.abs(diffMs) / msDay);

    if (diffMs > msDay) {
      return { label: `Quedan ${absDays} días`, cls: absDays > 2 ? 'ok' : 'warn' };
    }
    if (diffMs > 0 && diffMs <= msDay) {
      return { label: 'Vence hoy', cls: 'warn' };
    }
    // vencida
    return { label: `Atrasada por ${absDays} días`, cls: 'over' };
  }
}
