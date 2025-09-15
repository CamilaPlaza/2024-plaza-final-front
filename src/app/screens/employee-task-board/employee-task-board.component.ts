import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';

type ColKey = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  note?: string;
  tag?: string;
}

@Component({
  selector: 'app-employee-task-board',
  templateUrl: './employee-task-board.component.html',
  styleUrls: ['./employee-task-board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeTaskBoardComponent implements OnInit {

  // Contexto que te pasa Workday
  @Input() employeeUid!: string;
  @Input() employeeName!: string;
  @Input() shift!: { id: string; name: string; start: string; end: string }; // no-null => sin ?.
  @Input() attendanceOpen: boolean = false;

  // Opcional: para avisar al contenedor cuando cambie estado
  @Output() taskStatusChanged = new EventEmitter<{ taskId: string; status: 'assigned' | 'in_progress' | 'done' }>();

  // Estado UI
  loading = false;
  over = { todo: false, doing: false, done: false };

  // Columnas
  tasksTodo: Task[] = [];
  tasksDoing: Task[] = [];
  tasksDone: Task[] = [];

  ngOnInit(): void {
    this.loadMockTasks();
    // TODO backend:
    // this.fetchTasksForEmployee(this.employeeUid);
  }

  // ======================
  // Drag & Drop handlers
  // ======================
  onDragStart(ev: DragEvent, task: Task, from: ColKey): void {
    try {
      ev.dataTransfer?.setData('text/plain', JSON.stringify({ id: task.id, from }));
      if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
    } catch {}
  }

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
  }

  onDragEnter(col: ColKey): void { this.over[col] = true; }
  onDragLeave(col: ColKey): void { this.over[col] = false; }

  onDrop(ev: DragEvent, to: ColKey): void {
    ev.preventDefault();
    const raw = ev.dataTransfer?.getData('text/plain');
    this.over[to] = false;
    if (!raw) return;

    try {
      const { id, from } = JSON.parse(raw) as { id: string; from: ColKey };
      if (from === to) return;
      const src = this.getList(from), dst = this.getList(to);
      const i = src.findIndex(t => t.id === id);
      if (i === -1) return;
      const [task] = src.splice(i, 1);
      dst.unshift(task);

      // TODO backend: persistir nuevo estado
      // await this.patchTaskStatus(task.id, this.mapColKeyToStatus(to));

      this.taskStatusChanged.emit({ taskId: task.id, status: this.mapColKeyToStatus(to) });
    } catch {}
  }

  private getList(k: ColKey){ return k==='todo'?this.tasksTodo:k==='doing'?this.tasksDoing:this.tasksDone; }
  private mapColKeyToStatus(k: ColKey): 'assigned'|'in_progress'|'done' {
    return k === 'todo' ? 'assigned' : k === 'doing' ? 'in_progress' : 'done';
  }

  // ======================
  // Mock inicial (reemplazá por fetch real)
  // ======================
  private loadMockTasks(): void {
    this.tasksTodo = [
      { id: 't1', title: 'Prep espresso station', note: 'Restock cups & napkins', tag: 'Bar' },
      { id: 't2', title: 'Clean patio tables', note: 'After rush', tag: 'Floor' },
    ];
    this.tasksDoing = [
      { id: 't3', title: 'Update croissant stock', note: 'Ask kitchen', tag: 'Inventory' },
    ];
    this.tasksDone = [
      { id: 't4', title: 'Check grinder calibration', tag: 'Bar' },
    ];
  }

  // ======================
  // Hooks a backend (ejemplo de interfaz para después)
  // ======================
  // private async fetchTasksForEmployee(uid: string) { ... }
  // private async patchTaskStatus(taskId: string, status: 'assigned'|'in_progress'|'done') { ... }
}
