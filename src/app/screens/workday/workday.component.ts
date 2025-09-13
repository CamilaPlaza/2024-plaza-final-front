import { Component, OnInit } from '@angular/core';

type ColKey = 'todo' | 'doing' | 'done';

interface Task {
  id: string;
  title: string;
  note?: string;
  tag?: string;
}


@Component({
  selector: 'app-workday',
  templateUrl: './workday.component.html',
  styleUrls: ['./workday.component.css'],
})
export class WorkdayComponent implements OnInit {

  // Estado de asistencia (mock por ahora)
  attendanceOpen = false;
  checkInTime: string | null = null;
  checkOutTime: string | null = null;
  tipsToday = 17.50;

  // Shift asignado (mock)
  shift = { name: 'Morning', start: '07:00', end: '13:00' };
  get shiftLabel(): string { return `${this.shift.start}–${this.shift.end}`; }

  // Board de tareas
  tasksTodo: Task[] = [
    { id: 't1', title: 'Prep espresso station', note: 'Restock cups & napkins', tag: 'Bar' },
    { id: 't2', title: 'Clean patio tables', note: 'After rush', tag: 'Floor' },
  ];
  tasksDoing: Task[] = [
    { id: 't3', title: 'Update croissant stock', note: 'Ask kitchen', tag: 'Inventory' },
  ];
  tasksDone: Task[] = [
    { id: 't4', title: 'Check grinder calibration', tag: 'Bar' },
  ];

  // Estado visual de dragover por columna
  over = { todo: false, doing: false, done: false };

  ngOnInit(): void {
    // TODO: traer shift real, open-attendance, tips de hoy y tareas asignadas desde back
  }

  // Acciones check-in/out (stubs)
  onCheckIn(): void {
    // TODO: assistanceService.checkIn(...)
    this.attendanceOpen = true;
    this.checkInTime = this.nowText();
    this.checkOutTime = null;
  }

  onCheckOut(): void {
    // TODO: assistanceService.checkOut(attendanceId)
    this.attendanceOpen = false;
    this.checkOutTime = this.nowText();
  }

  // Drag & Drop
  onDragStart(ev: DragEvent, task: Task, from: ColKey): void {
    if (!ev.dataTransfer) return;
    ev.dataTransfer.setData('text/plain', JSON.stringify({ id: task.id, from }));
    ev.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(ev: DragEvent): void {
    ev.preventDefault(); // necesario para permitir drop
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
      if (!id || !from) return;
      if (from === to) return;

      const src = this.getList(from);
      const dst = this.getList(to);
      const idx = src.findIndex(t => t.id === id);
      if (idx === -1) return;

      const [task] = src.splice(idx, 1);
      dst.unshift(task); // lo agrego arriba

      // (Opcional) acá podrías persistir el nuevo estado de la tarea en el back.
      // e.g., assistanceService.updateTaskState(task.id, to)

    } catch { /* ignore */ }
  }

  private getList(key: ColKey): Task[] {
    return key === 'todo' ? this.tasksTodo : key === 'doing' ? this.tasksDoing : this.tasksDone;
  }

  // Util
  private nowText(): string {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
