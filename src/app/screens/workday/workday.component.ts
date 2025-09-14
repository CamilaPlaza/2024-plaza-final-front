import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssistanceService } from 'src/app/services/assistance_service';
import { UserService } from 'src/app/services/user_service';
import { Subscription, lastValueFrom } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from 'src/app/services/firebaseconfig';

type ColKey = 'todo' | 'doing' | 'done';
interface Task { id: string; title: string; note?: string; tag?: string; }

const TAG = '[WORKDAY]';

@Component({
  selector: 'app-workday',
  templateUrl: './workday.component.html',
  styleUrls: ['./workday.component.css'],
})
export class WorkdayComponent implements OnInit, OnDestroy {
  pageLoading = true;
  loading = false;

  uid: string | null = null;
  userName = 'Employee';

  attendanceOpen = false;
  attendanceId: string | null = null;
  allowCheckIn = false;

  checkInTime: string | null = null;
  checkOutTime: string | null = null;

  showCheckInPopup = false;
  showCheckOutPopup = false;

  tipsToday = 17.50;

  shift = { id: 'UNASSIGNED', name: '—', start: '—', end: '—' };
  get shiftLabel(): string { return `${this.shift.start}–${this.shift.end}`; }

  tasksTodo: Task[] = [
    { id: 't1', title: 'Prep espresso station', note: 'Restock cups & napkins', tag: 'Bar' },
    { id: 't2', title: 'Clean patio tables', note: 'After rush', tag: 'Floor' },
  ];
  tasksDoing: Task[] = [{ id: 't3', title: 'Update croissant stock', note: 'Ask kitchen', tag: 'Inventory' }];
  tasksDone: Task[] = [{ id: 't4', title: 'Check grinder calibration', tag: 'Bar' }];
  over = { todo: false, doing: false, done: false };

  private sub?: Subscription;
  private authUnsub?: () => void;

  constructor(
    private assistance: AssistanceService,
    public userService: UserService,
  ) {}

  ngOnInit(): void {
    console.log(TAG, 'init');

    if (this.userService.currentUserData?.uid) {
      this.initForUid(this.userService.currentUserData.uid, this.userService.currentUserData.name);
    }

    this.sub = this.userService.currentUserData$.subscribe(async (u: any) => {
      if (u?.uid) await this.initForUid(u.uid, u.name);
    });

    this.authUnsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser?.uid) return;
      if (this.uid) return;
      try {
        const obs = await this.userService.getUserDataFromFirestore(fbUser.uid);
        (await obs).subscribe((data: any) => {
          const userData = { ...(data || {}), uid: fbUser.uid };
          this.userService.currentUserData = userData;
          this.userService.currentUserData$.next(userData);
        });
      } catch {
        await this.initForUid(fbUser.uid, 'Employee');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.authUnsub) this.authUnsub();
  }

  private async initForUid(uid: string, name?: string): Promise<void> {
    this.pageLoading = true;
    this.uid = uid;
    if (name) this.userName = name;

    try {
      await this.loadAssignedShift(uid);
      await this.refreshAttendanceState(uid);
    } finally {
      this.pageLoading = false;
    }
  }

  get showCheckInButton(): boolean  { return !this.pageLoading && !this.attendanceOpen && this.allowCheckIn; }
  get showCheckOutButton(): boolean { return !this.pageLoading && this.attendanceOpen; }

  onCheckIn(): void { this.showCheckInPopup = true; }
  async onPopupClosed(): Promise<void> {
    this.showCheckInPopup = false;
    if (!this.uid) return;
    this.pageLoading = true;
    try { await this.refreshAttendanceState(this.uid); } finally { this.pageLoading = false; }
  }

  onCheckOut(): void { this.showCheckOutPopup = true; }
  async onCheckoutClosed(): Promise<void> {
    this.showCheckOutPopup = false;
    if (!this.uid) return;
    this.pageLoading = true;
    try { await this.refreshAttendanceState(this.uid); } finally { this.pageLoading = false; }
  }

  private async loadAssignedShift(uid: string): Promise<void> {
    try {
      const s: any = await lastValueFrom(this.assistance.getAssignedShiftForEmployee(uid));
      this.shift = {
        id: s?.id ?? 'UNASSIGNED',
        name: s?.name ?? '—',
        start: s?.start_time ?? '—',
        end: s?.end_time ?? '—',
      };
    } catch {
      try {
        const cur = await lastValueFrom(this.assistance.getCurrentShiftId());
        this.shift.id = (cur as any)?.shift_id ?? 'UNASSIGNED';
      } catch {}
    }
  }

  private async refreshAttendanceState(uid: string): Promise<void> {
    let openResp: any = null;
    try { openResp = await lastValueFrom(this.assistance.getOpenAttendance(uid)); } catch {}

    this.attendanceOpen = !!openResp?.open;
    this.attendanceId   = openResp?.attendance_id ?? null;

    try { await this.loadTodayTimes(uid); } catch {}

    if (this.attendanceOpen) {
      this.allowCheckIn = false;
      return;
    }

    const sid = this.shift.id && this.shift.id !== 'UNASSIGNED' ? this.shift.id : null;
    let prev: any = null;
    if (sid) {
      try { prev = await lastValueFrom(this.assistance.getCheckinPreview(uid, sid)); } catch {}
    }
    this.allowCheckIn = !!prev?.can_check_in && prev?.reason !== 'already_completed' && prev?.reason !== 'already_open';
  }

  private async loadTodayTimes(uid: string): Promise<void> {
    const data: any = await lastValueFrom(this.assistance.getTodayAttendance(uid));
    this.attendanceId = data?.id ?? this.attendanceId;
    this.checkInTime  = data?.check_in_time  ? this.formatHHMM(data.check_in_time)  : null;
    this.checkOutTime = data?.check_out_time ? this.formatHHMM(data.check_out_time) : null;
    if (!this.checkInTime && this.attendanceOpen) this.checkInTime = this.nowHHMM();
  }

  onDragStart(ev: DragEvent, task: Task, from: ColKey): void {
    ev.dataTransfer?.setData('text/plain', JSON.stringify({ id: task.id, from }));
    if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
  }
  onDragOver(ev: DragEvent): void { ev.preventDefault(); if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move'; }
  onDragEnter(col: ColKey): void { this.over[col] = true; }
  onDragLeave(col: ColKey): void { this.over[col] = false; }
  onDrop(ev: DragEvent, to: ColKey): void {
    ev.preventDefault();
    const raw = ev.dataTransfer?.getData('text/plain'); this.over[to] = false;
    if (!raw) return;
    try {
      const { id, from } = JSON.parse(raw) as { id: string; from: ColKey };
      if (from === to) return;
      const src = this.getList(from), dst = this.getList(to);
      const i = src.findIndex(t => t.id === id); if (i === -1) return;
      const [task] = src.splice(i, 1); dst.unshift(task);
    } catch {}
  }
  private getList(k: ColKey){ return k==='todo'?this.tasksTodo:k==='doing'?this.tasksDoing:this.tasksDone; }

  private formatHHMM(iso: string): string {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  private nowHHMM(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
