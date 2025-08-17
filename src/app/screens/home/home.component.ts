// home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { filter, distinctUntilChanged, switchMap, takeUntil, tap, catchError, map } from 'rxjs/operators';
import { UserService } from 'src/app/services/user_service';
import { AssistanceService } from 'src/app/services/assistance_service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  showCheckInPopup = false;
  userName = '';
  attendanceId: string | null = null;
  currentShiftId = '';

  private destroy$ = new Subject<void>();

  constructor(
    public userService: UserService,
    private router: Router,
    private assistanceService: AssistanceService
  ) {}

  ngOnInit(): void {
    console.log('estoy en el home');

    this.userService.currentUserData$
      .pipe(
        // 1) ignorar null/undefined
        filter((data: any) => !!data),

        // 2) evitar repetir mismas emisiones (por ejemplo al reentrar al componente)
        distinctUntilChanged((a: any, b: any) =>
          a?.uid === b?.uid &&
          a?.role === b?.role &&
          a?.name === b?.name
        ),

        tap((userData: any) => {
          console.log('userData recibido:', userData);
          if (userData?.role === 'EMPLOYEE') {
            this.userName = userData.name || 'Empleado';
          }
        }),

        // 3) si no es EMPLOYEE o no hay uid, no hacemos nada
        switchMap((userData: any) => {
          if (!userData?.uid || userData?.role !== 'EMPLOYEE') {
            this.showCheckInPopup = false;
            return of(null);
          }
          const uid = userData.uid as string;

          // 4) pedir turno actual y luego asistencia abierta
          return this.assistanceService.getCurrentShiftId().pipe(
            tap((res: any) => {
              this.currentShiftId = res?.shift_id ?? '';
            }),
            switchMap((res: any) => {
              const shiftId = res?.shift_id;
              if (!shiftId) {
                // no hay turno -> no popup
                this.showCheckInPopup = false;
                return of(null);
              }
              return this.assistanceService.getOpenAttendance(uid, shiftId).pipe(
                tap((att: any) => {
                  // tiene check-in abierto
                  this.attendanceId = att?.attendance_id ?? null;
                  this.showCheckInPopup = false;
                }),
                catchError(() => {
                  // no tiene check-in -> mostrar popup
                  this.attendanceId = null;
                  this.showCheckInPopup = true;
                  return of(null);
                })
              );
            }),
            catchError(() => {
              // error obteniendo turno -> no popup
              this.showCheckInPopup = false;
              return of(null);
            })
          );
        }),

        // 5) liberar suscripción al destruir el componente
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCheckIn(observations: string) {
    const uid = this.userService.currentUser?.uid;
    if (!uid || !this.currentShiftId) return;

    this.assistanceService.checkIn(uid, this.currentShiftId, observations)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.attendanceId = res?.id ?? null;
          this.showCheckInPopup = false;
        },
        error: (err) => {
          console.error('Error al hacer check-in', err);
        }
      });
  }

  navigateToTables(): void { this.router.navigate(['/tables']); }
  navigateToOrders(): void { this.router.navigate(['/orders']); }
  navigateToProductsView(): void { this.router.navigate(['/products-view']); }
}
