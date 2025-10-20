import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { filter, distinctUntilChanged, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
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
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    public userService: UserService,
    private router: Router,
    private assistanceService: AssistanceService
  ) {}

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.isLoading = false;
    this.userService.currentUserData$
      .pipe(
        filter((data: any) => !!data),
        tap(() => {
          document.body.style.overflow = '';
        }),
        distinctUntilChanged((a: any, b: any) =>
          a?.uid === b?.uid && a?.role === b?.role && a?.name === b?.name
        ),
        tap((userData: any) => {
          if (userData?.role === 'EMPLOYEE') {
            this.userName = userData.name || 'Empleado';
          } else {
            this.showCheckInPopup = false;
          }
        }),
        switchMap((userData: any) => {
          if (!userData?.uid || userData?.role !== 'EMPLOYEE') {
            return of(null);
          }
          const uid = userData.uid as string;

          return this.assistanceService.getCurrentShiftId().pipe(
            tap((res: any) => {
              this.currentShiftId = res?.shift_id ?? 'UNASSIGNED';
            }),
            switchMap(() => {
              return this.assistanceService.getOpenAttendance(uid).pipe(
                tap((att: any) => {
                  if (att?.open) {
                    this.attendanceId = att.attendance_id ?? null;
                    this.showCheckInPopup = false;
                  } else {
                    this.attendanceId = null;
                    this.showCheckInPopup = true;
                  }
                }),
                catchError(() => {
                  this.attendanceId = null;
                  this.showCheckInPopup = true;
                  return of(null);
                })
              );
            }),
            catchError(() => {
              this.currentShiftId = 'UNASSIGNED';
              return this.assistanceService.getOpenAttendance(uid).pipe(
                tap((att: any) => {
                  if (att?.open) {
                    this.attendanceId = att.attendance_id ?? null;
                    this.showCheckInPopup = false;
                  } else {
                    this.attendanceId = null;
                    this.showCheckInPopup = true;
                  }
                }),
                catchError(() => {
                  this.attendanceId = null;
                  this.showCheckInPopup = true;
                  return of(null);
                })
              );
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToTables(): void { this.router.navigate(['/tables']); }
  navigateToOrders(): void { this.router.navigate(['/orders']); }
  navigateToProductsView(): void { this.router.navigate(['/products-view']); }
}
