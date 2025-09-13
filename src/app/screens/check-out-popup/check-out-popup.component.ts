import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { AssistanceService } from 'src/app/services/assistance_service';
import { UserService } from 'src/app/services/user_service';

@Component({
  selector: 'app-check-out-popup',
  templateUrl: './check-out-popup.component.html',
  styleUrl: './check-out-popup.component.css'
})
export class CheckOutPopupComponent implements OnInit, OnDestroy {
  @Input() userName: string = '';
  @Output() closed = new EventEmitter<void>();

  currentTime: string = '';
  observations: string = '';
  loadingPreview = false;
  loadingSubmit  = false;
  previewInfo: any = null;
  resultInfo:  any = null;

  private shiftId: string = 'UNASSIGNED';
  private destroy$ = new Subject<void>();

  constructor(
    private assistanceService: AssistanceService,
    public  userService: UserService
  ) {}

  ngOnInit() {
    this.setLocalTime();

    const uid = this.userService.currentUser?.uid;
    if (!uid) {
      this.userService.currentUserData$
        .pipe(
          takeUntil(this.destroy$),
          switchMap((u: any) => {
            const finalUid = u?.uid;
            if (!finalUid) return of(null);
            return this.loadPreview(finalUid);
          })
        )
        .subscribe();
    } else {
      this.loadPreview(uid).pipe(takeUntil(this.destroy$)).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============== Flujo principal ===============

  private loadPreview(uid: string) {
    this.loadingPreview = true;

    return this.assistanceService.getAssignedShiftForEmployee(uid).pipe(
      switchMap((shift: any) => {
        this.shiftId = shift?.id ?? 'UNASSIGNED';
        console.log('[CheckIn] assigned shiftId:', this.shiftId, shift);
        return this.assistanceService.getCheckinPreview(uid, this.shiftId);
      }),
      catchError((err) => {
        console.error('[CheckIn] assigned shift error:', err);
        // Fallback: si falla, permití check-in pero marcá fuera de turno
        return of({ can_check_in: true, reason: 'ok', off_shift: true });
      }),
      switchMap((prev: any) => {
        this.previewInfo = prev;
        console.log('[CheckIn] preview:', prev);
        if (prev?.now) this.currentTime = this.formatTime(prev.now);
        this.loadingPreview = false;
        return of(null);
      })
    );
  }


  onConfirm() {
    if (this.loadingPreview || this.loadingSubmit) return;

    const uid = this.userService.currentUser?.uid;
    if (!uid || this.previewInfo?.can_check_in === false) return;

    this.loadingSubmit = true;
    this.assistanceService
      .checkIn(uid, this.shiftId || 'UNASSIGNED', this.observations || '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.resultInfo = res;

          if (res?.check_in_time) this.currentTime = this.formatTime(res.check_in_time);
          this.loadingSubmit = false;
        },
        error: () => { this.loadingSubmit = false; }
      });
  }

  onClose() {
    this.closed.emit();
  }

  private setLocalTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private formatTime(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return this.currentTime;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
