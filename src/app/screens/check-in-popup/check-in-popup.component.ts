import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { AssistanceService } from 'src/app/services/assistance_service';
import { UserService } from 'src/app/services/user_service';

@Component({
  selector: 'app-check-in-popup',
  templateUrl: './check-in-popup.component.html',
  styleUrls: ['./check-in-popup.component.css']
})
export class CheckInPopupComponent implements OnInit, OnDestroy {
  @Input() userName: string = '';
  @Output() closed = new EventEmitter<void>();

  currentTime: string = '';
  observations: string = '';
  loadingPreview = false;
  loadingSubmit  = false;

  previewInfo: any = null;
  resultInfo:  any = null;   // ← agregado para que compile el template

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

  private loadPreview(uid: string) {
    this.loadingPreview = true;

    return this.assistanceService.getAssignedShiftForEmployee(uid).pipe(
      switchMap((shift: any) => {
        this.shiftId = shift?.id ?? 'UNASSIGNED';
        return this.assistanceService.getCheckinPreview(uid, this.shiftId);
      }),
      catchError(() => of({ can_check_in: true, reason: 'ok', off_shift: true })),
      switchMap((prev: any) => {
        this.previewInfo = prev;
        if (prev?.now) this.currentTime = this.formatTime(prev.now);
        this.loadingPreview = false;

        // auto-cerrar si no corresponde abrir
        if (prev?.can_check_in === false && (prev?.reason === 'already_open' || prev?.reason === 'already_completed')) {
          setTimeout(() => this.onClose(), 0);
        }
        return of(null);
      })
    );
  }

  onConfirm() {
    if (this.loadingPreview || this.loadingSubmit) return;

    const uid = this.userService.currentUser?.uid;
    if (!uid || this.previewInfo?.can_check_in === false) return;

    this.loadingSubmit = true;

    // No usamos takeUntil acá para que no se cancele si el modal se cierra
    this.assistanceService
      .checkIn(uid, this.shiftId || 'UNASSIGNED', this.observations || '')
      .subscribe({
        next: () => { this.loadingSubmit = false; this.onClose(); },
        error: () => { this.loadingSubmit = false; this.onClose(); }
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
