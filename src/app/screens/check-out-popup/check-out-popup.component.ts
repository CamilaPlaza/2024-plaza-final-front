import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, of, forkJoin } from 'rxjs';
import { catchError, switchMap, takeUntil, map } from 'rxjs/operators';
import { AssistanceService } from 'src/app/services/assistance_service';
import { UserService } from 'src/app/services/user_service';

@Component({
  selector: 'app-check-out-popup',
  templateUrl: './check-out-popup.component.html',
  styleUrls: ['./check-out-popup.component.css']
})
export class CheckOutPopupComponent implements OnInit, OnDestroy {
  @Input() userName: string = '';
  @Output() closed = new EventEmitter<void>();

  loadingPreview = false;
  loadingSubmit  = false;
  currentTime = '';

  preview: {
    workedMin: number;
    expected_start?: string | null;
    expected_end?: string | null;
    check_in_time?: string | null;
  } | null = null;

  private uid: string | null = null;
  private attendanceId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private assistance: AssistanceService,
    public  userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const direct = this.userService.currentUser?.uid ?? null;
    if (direct) {
      this.uid = direct;
      this.loadPreview(direct).pipe(takeUntil(this.destroy$)).subscribe();
      return;
    }

    this.userService.currentUserData$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(u => {
          const uid = u?.uid as string | undefined;
          if (!uid) return of(null);
          this.uid = uid;
          return this.loadPreview(uid);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPreview(uid: string) {
    this.loadingPreview = true;

    return this.assistance.getOpenAttendance(uid).pipe(
      switchMap((open: any) => {
        if (!open?.open || !open?.attendance_id) {
          this.loadingPreview = false;
          this.onClose();
          return of(null);
        }
        this.attendanceId = open.attendance_id;

        return forkJoin({
          today: this.assistance.getTodayAttendance(uid).pipe(catchError(() => of(null))),
          shift: this.assistance.getAssignedShiftForEmployee(uid).pipe(catchError(() => of(null))),
        }).pipe(
          map(({ today, shift }: any) => {
            const checkInIso: string | null = today?.check_in_time ?? null;
            const startStr: string | null = shift?.start_time ?? null;
            const endStr:   string | null = shift?.end_time   ?? null;

            const now = new Date();
            const checkIn = checkInIso ? new Date(checkInIso) : null;

            let workedMin = 0;
            if (checkIn) workedMin = Math.max(0, Math.floor((now.getTime() - checkIn.getTime()) / 60000));

            this.preview = {
              workedMin,
              expected_start: startStr,
              expected_end: endStr,
              check_in_time: checkInIso,
            };
            this.loadingPreview = false;
          })
        );
      }),
      catchError(() => {
        this.loadingPreview = false;
        this.onClose();
        return of(null);
      })
    );
  }

  onConfirm(): void {
    if (this.loadingSubmit || !this.attendanceId) return;
    this.loadingSubmit = true;
    this.assistance.checkOut(this.attendanceId).subscribe({
      next: () => { this.loadingSubmit = false; this.onClose(); },
      error: () => { this.loadingSubmit = false; this.onClose(); }
    });
  }

  onClose(): void { this.closed.emit(); }

  mmToHhMm(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h <= 0) return `${m} min`;
    return `${h} h ${m} min`;
  }
}
