import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssistanceService } from 'src/app/services/assistance_service';
import { UserService } from 'src/app/services/user_service';
import { Subscription, lastValueFrom } from 'rxjs';

// Fallback a Firebase Auth
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
  loading = false;

  uid: string | null = null;
  userName = 'Employee';

  attendanceOpen = false;
  attendanceId: string | null = null;
  allowCheckIn = false;

  checkInTime: string | null = null;
  checkOutTime: string | null = null;

  showCheckInPopup = false;

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

  // ========= INIT =========
  ngOnInit(): void {
    console.log(TAG, 'init');

    // 1) Si ya tengo los datos en memoria, arranco.
    if (this.userService.currentUserData?.uid) {
      console.log(TAG, 'boot with currentUserData in memory', this.userService.currentUserData);
      this.initForUid(this.userService.currentUserData.uid, this.userService.currentUserData.name);
    }

    // 2) Me suscribo al BehaviorSubject por si el login los empuja luego.
    this.sub = this.userService.currentUserData$.subscribe(async (u: any) => {
      console.log(TAG, 'userService.currentUserData$ emit', u);
      if (u?.uid) {
        await this.initForUid(u.uid, u.name);
      }
    });

    // 3) Fallback: si refrescaste y el BehaviorSubject está null, uso Firebase Auth.
    this.authUnsub = onAuthStateChanged(auth, async (fbUser) => {
      console.log(TAG, 'onAuthStateChanged', fbUser?.uid || null);
      if (!fbUser?.uid) return;
      if (this.uid) return; // ya inicializado

      // Traigo los datos del usuario desde tu back y alimento el BehaviorSubject
      try {
        const obs = await this.userService.getUserDataFromFirestore(fbUser.uid); // devuelve Promise<Observable<any>>
        (await obs).subscribe((data: any) => {
          try {
            // Normalizo y empujo a tu servicio para que el resto de la app lo tenga
            const userData = { ...(data || {}), uid: fbUser.uid };
            this.userService.currentUserData = userData;
            this.userService.currentUserData$.next(userData);
            console.log(TAG, 'user data loaded via API (fallback)', userData);
            // initForUid se disparará por la suscripción del punto 2
          } catch (e) {
            console.error(TAG, 'fallback set userData error', e);
          }
        });
      } catch (e) {
        console.error(TAG, 'fallback getUserDataFromFirestore error', e);
        // Último recurso: inicializo con sólo el uid
        await this.initForUid(fbUser.uid, 'Employee');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.authUnsub) this.authUnsub();
  }

  private async initForUid(uid: string, name?: string): Promise<void> {
    this.uid = uid;
    if (name) this.userName = name;
    console.log(TAG, 'initForUid', { uid: this.uid, userName: this.userName });

    await this.loadAssignedShift(uid);
    await this.refreshAttendanceState(uid);
  }

  // ========= UI helpers =========
  get showCheckInButton(): boolean  { return !this.attendanceOpen && this.allowCheckIn; }
  get showCheckOutButton(): boolean { return this.attendanceOpen; }

  onCheckIn(): void {
    console.log(TAG, 'onCheckIn click');
    this.showCheckInPopup = true;
  }

  async onPopupClosed(): Promise<void> {
    console.log(TAG, 'popup closed → refresh');
    this.showCheckInPopup = false;
    if (!this.uid) return;
    await this.refreshAttendanceState(this.uid);
  }

  async onCheckOut(): Promise<void> {
    if (!this.uid) return;
    console.log(TAG, 'onCheckOut click');
    this.loading = true;
    try {
      if (!this.attendanceId) {
        const open: any = await lastValueFrom(this.assistance.getOpenAttendance(this.uid));
        console.log(TAG, 'open-attendance resp', open);
        this.attendanceId = open?.attendance_id ?? null;
      }
      if (!this.attendanceId) { console.warn(TAG, 'no attendanceId to checkout'); return; }

      const res = await lastValueFrom(this.assistance.checkOut(this.attendanceId));
      console.log(TAG, 'checkout resp', res);
      await this.refreshAttendanceState(this.uid);
    } catch (e) {
      console.error(TAG, 'checkout error', e);
    } finally {
      this.loading = false;
    }
  }

  // ========= Data loaders =========
  private async loadAssignedShift(uid: string): Promise<void> {
    console.log(TAG, 'loadAssignedShift start', { uid });
    try {
      const s: any = await lastValueFrom(this.assistance.getAssignedShiftForEmployee(uid));
      console.log(TAG, 'assigned shift resp', s);
      this.shift = {
        id: s?.id ?? 'UNASSIGNED',
        name: s?.name ?? '—',
        start: s?.start_time ?? '—',
        end: s?.end_time ?? '—',
      };
    } catch (e) {
      console.warn(TAG, 'assigned shift failed, fallback to current shift', e);
      try {
        const cur = await lastValueFrom(this.assistance.getCurrentShiftId());
        console.log(TAG, 'current shift resp', cur);
        this.shift.id = (cur as any)?.shift_id ?? 'UNASSIGNED';
      } catch (e2) {
        console.error(TAG, 'current shift failed', e2);
      }
    }
    console.log(TAG, 'shift=', this.shift);
  }

  private async refreshAttendanceState(uid: string): Promise<void> {
    console.log(TAG, 'refreshAttendanceState start', { uid });

    let openResp: any = null;
    try {
      openResp = await lastValueFrom(this.assistance.getOpenAttendance(uid));
      console.log(TAG, 'open-attendance resp', openResp);
    } catch (e) {
      console.error(TAG, 'open-attendance error', e);
    }

    this.attendanceOpen = !!openResp?.open;
    this.attendanceId   = openResp?.attendance_id ?? null;
    console.log(TAG, 'state: attendanceOpen=', this.attendanceOpen, 'attendanceId=', this.attendanceId);

    try {
      await this.loadTodayTimes(uid);
    } catch (e) {
      console.error(TAG, 'today-times error', e);
    }

    if (this.attendanceOpen) {
      this.allowCheckIn = false;
      console.log(TAG, 'allowCheckIn=false (open)');
      return;
    }

    const sid = this.shift.id && this.shift.id !== 'UNASSIGNED' ? this.shift.id : null;
    let prev: any = null;
    if (sid) {
      try {
        prev = await lastValueFrom(this.assistance.getCheckinPreview(uid, sid));
        console.log(TAG, 'checkin-preview resp', prev);
      } catch (e) {
        console.error(TAG, 'checkin-preview error', e);
      }
    }
    this.allowCheckIn = !!prev?.can_check_in && prev?.reason !== 'already_completed' && prev?.reason !== 'already_open';
    console.log(TAG, 'allowCheckIn=', this.allowCheckIn);
  }

  private async loadTodayTimes(uid: string): Promise<void> {
    console.log(TAG, 'GET today start', { uid });
    const data: any = await lastValueFrom(this.assistance.getTodayAttendance(uid));
    console.log(TAG, 'today resp', data);

    this.attendanceId = data?.id ?? this.attendanceId;
    this.checkInTime  = data?.check_in_time  ? this.formatHHMM(data.check_in_time)  : null;
    this.checkOutTime = data?.check_out_time ? this.formatHHMM(data.check_out_time) : null;

    if (!this.checkInTime && this.attendanceOpen) this.checkInTime = this.nowHHMM();

    console.log(TAG, 'times -> in:', this.checkInTime, 'out:', this.checkOutTime);
  }

  // ========= Board (igual) =========
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
