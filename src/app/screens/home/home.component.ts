import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { Router } from '@angular/router';
import { AssistanceService } from 'src/app/services/assistance_service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  showCheckInPopup = false;
  userName = '';
  attendanceId: string | null = null;
  currentShiftId: string = '';

  constructor(
    public userService: UserService,
    private router: Router,
    private assistanceService: AssistanceService
  ) {}

  ngOnInit(): void {
    console.log("estoy en el home");

    this.userService.currentUserData$
      .pipe(
        filter(data => !!data), // Esperamos hasta que tenga data
      )
      .subscribe(userData => {
        console.log('userData recibido:', userData);

        if (userData.role === 'EMPLOYEE') {
          this.userName = userData.name || 'Empleado';

          if (userData.uid) {
            this.checkIfUserHasCheckedIn(userData.uid);
          } else {
            console.warn('userData.uid es undefined');
          }
        }
      });
  }



  checkIfUserHasCheckedIn(uid: string) {
    if (!uid || uid === 'undefined') {
      console.warn('No se puede chequear asistencia: uid inválido');
      return;
    }

    this.assistanceService.getCurrentShiftId().subscribe({
      next: (res: any) => {
        const currentShiftId = res.shift_id;
        this.currentShiftId = currentShiftId;

        this.assistanceService.getOpenAttendance(uid, currentShiftId).subscribe({
          next: (res: any) => {
            console.log('Ya tiene check-in:', res);
            this.attendanceId = res.attendance_id;
            this.showCheckInPopup = false;
          },
          error: () => {
            console.log('No tiene check-in: mostramos popup');
            this.showCheckInPopup = true;
          }
        });
      },
      error: () => {
        console.warn('No hay turno actual. No se muestra popup.');
        this.showCheckInPopup = false;
      }
    });
  }


  handleCheckIn(observations: string) {
    const uid = this.userService.currentUser?.uid;
    if (!uid) return;

    this.assistanceService.checkIn(uid, this.currentShiftId, observations)
      .subscribe({
        next: (res: any) => {
          this.attendanceId = res.id;
          this.showCheckInPopup = false;
        },
        error: (err) => {
          console.error('Error al hacer check-in', err);
        }
      });
  }

  navigateToTables(): void {
    this.router.navigate(['/tables']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }

  navigateToProductsView(): void {
    this.router.navigate(['/products-view']);
  }




}
