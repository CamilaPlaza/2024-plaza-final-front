import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssistanceService } from 'src/app/services/assistance_service';
import { UserService } from 'src/app/services/user_service';
import { Subscription, lastValueFrom } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from 'src/app/services/firebaseconfig';
import { UiUser } from 'src/app/models/task';

const TAG = '[WORKDAY]';

@Component({
  selector: 'app-workday',
  templateUrl: './workday.component.html',
  styleUrls: ['./workday.component.css'],
})
export class WorkdayComponent implements OnInit, OnDestroy {
  pageLoading = true;
  loading = false;

  // Usuario/rol
  user: UiUser | null = null;

  // Asistencia
  attendanceOpen = false;
  attendanceId: string | null = null;
  allowCheckIn = false;
  checkInTime: string | null = null;
  checkOutTime: string | null = null;

  // Turno
  shift = { id: 'UNASSIGNED', name: '—', start: '—', end: '—' };
  get shiftLabel(): string { return `${this.shift.start}–${this.shift.end}`; }

  showCheckInPopup = false;
  showCheckOutPopup = false;
  tipsToday = 17.50;

  private sub?: Subscription;
  private authUnsub?: () => void;

  constructor(
    private assistance: AssistanceService,
    public userService: UserService,
  ) {}

  ngOnInit(): void {
    console.log(TAG, 'init');

    // Si ya hay user en memoria…
    const u0 = this.userService.currentUserData;
    if (u0?.uid) this.initForUser(this.mapToUiUser(u0));

    // Suscripción a cambios del user
    this.sub = this.userService.currentUserData$.subscribe(async (u: any) => {
      if (u?.uid) await this.initForUser(this.mapToUiUser(u));
    });

    // Fallback Firebase
    this.authUnsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser?.uid) return;
      if (this.user?.uid) return;

      try {
        const obs = await this.userService.getUserDataFromFirestore(fbUser.uid);
        (await obs).subscribe((data: any) => {
          const userData = { ...(data || {}), uid: fbUser.uid };
          this.userService.currentUserData = userData;
          this.userService.currentUserData$.next(userData);
        });
      } catch {
        // Fallback extremo si no hay perfil: trato como employee
        await this.initForUser({
          uid: fbUser.uid,
          name: 'Employee',
          role: 'employee',
          requiresAttendance: true
        } as UiUser);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.authUnsub) this.authUnsub();
  }

  // --- UI helpers ---
  get showCheckInButton(): boolean  {
    return !this.pageLoading
      && !!this.user?.requiresAttendance
      && !this.attendanceOpen
      && this.allowCheckIn;
  }
  get showCheckOutButton(): boolean {
    return !this.pageLoading
      && !!this.user?.requiresAttendance
      && this.attendanceOpen;
  }

  // --- Events ---
  onCheckIn(): void { this.showCheckInPopup = true; }
  async onPopupClosed(): Promise<void> {
    this.showCheckInPopup = false;
    if (!this.user?.uid) return;
    this.pageLoading = true;
    try { await this.refreshAttendanceState(this.user.uid); } finally { this.pageLoading = false; }
  }

  onCheckOut(): void { this.showCheckOutPopup = true; }
  async onCheckoutClosed(): Promise<void> {
    this.showCheckOutPopup = false;
    if (!this.user?.uid) return;
    this.pageLoading = true;
    try { await this.refreshAttendanceState(this.user.uid); } finally { this.pageLoading = false; }
  }

  // --- Init + loaders ---
  private async initForUser(u: UiUser): Promise<void> {
    this.pageLoading = true;
    this.user = u;
    try {
      await this.loadAssignedShift(u.uid);
      await this.refreshAttendanceState(u.uid);
    } finally {
      this.pageLoading = false;
    }
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

  // --- fmt helpers ---
  private formatHHMM(iso: string): string {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  private nowHHMM(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private mapToUiUser(raw: any): UiUser {
    const role = this.normalizeRole(raw?.role);
    return {
      uid: String(raw?.uid),
      name: raw?.name || 'Employee',
      role,
      requiresAttendance: typeof raw?.requiresAttendance === 'boolean'
        ? raw.requiresAttendance
        : (role === 'employee'),
    } as UiUser;
  }

  private normalizeRole(r: any): 'employee' | 'admin' {
    const s = String(r ?? '').trim().toLowerCase();
    if (s === 'admin' || s === 'administrator') return 'admin';
    return 'employee';
  }
}
