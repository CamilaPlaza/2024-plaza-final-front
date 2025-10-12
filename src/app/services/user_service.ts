import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { auth } from '../services/firebaseconfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser, createUserWithEmailAndPassword, User, confirmPasswordReset } from 'firebase/auth';
import { Observable, BehaviorSubject  } from 'rxjs';
import { AuthService } from './auth_service';
import { EmployeeWithShift } from '../models/user';
import { Shift } from '../models/shift';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  currentUser: User | null = null;
  currentUserData: any = null;
  currentUserData$ = new BehaviorSubject<any>(null);

  //private baseUrl = 'https://candv-back.onrender.com';
  private baseUrl = 'http://127.0.0.1:8000';

  idleTime: number = 0;
  maxIdleTime: number = 10 * 60 * 1000;
  idleInterval: any;

  constructor(private http: HttpClient, private authService: AuthService) { }

  async login(email: string, password: string): Promise<boolean> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user?.uid;

    this.currentUser = userCredential.user;

    const user = userCredential.user;
    const idToken = await user.getIdToken();
    if (uid) {
      const userData = await this.fetchUserData(uid);
      userData.uid = uid;
      this.currentUserData = userData;
      this.currentUserData$.next(userData);
    }
    return true;
  } catch (error) {
    console.error('Error al iniciar sesión', error);
    return false;
  }
}

  private async fetchUserData(uid: string): Promise<any> {
    const url = `${this.baseUrl}/users/getByID/${uid}`;
    return this.http.get(url).toPromise();
  }

  logOut() {
    this.currentUser = null;
    this.currentUserData = null;
    this.currentUserData$.next(null);
    if (this.idleInterval) clearInterval(this.idleInterval);

    return this.authService.logout();
  }

  async getUserDataFromFirestore(uid: string): Promise<Observable<any>> {
    const url = `${this.baseUrl}/users/getByID/${uid}`;
    return this.http.get(url);
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent!');
    } catch (error: any) {
      console.error('Error sending password reset email:', error.message);
    }
  }

  async confirmPasswordReset(oobCode: string, newPassword: string) {
    return confirmPasswordReset(auth, oobCode, newPassword);
  }

  async deleteCurrentUser(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      this.http.delete(`${this.baseUrl}/users/deleteByID/${user.uid}`).toPromise();
      try {
        await deleteUser(user);
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    } else {
      return Promise.reject('No user is currently logged in');
    }
  }

  startIdleTimer() {
    this.idleInterval = setInterval(() => {
      this.idleTime += 1000;
      if (this.idleTime >= this.maxIdleTime) {
        this.logOut();
      }
    }, 1000);
  }

  resetIdleTime() {
    this.idleTime = 0;
  }


  async onRegister(
    email: string,
    password: string,
    name: string,
    birthday: string,
    imageUrl: string,
    shift_name: string
  ): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();

      const data = { uid: firebaseUser.uid, name, birthday, imageUrl, shift_name };

      await this.http.post(
        `${this.baseUrl}/users/register/`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return true;
    } catch (error: any) {
      if (error?.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        const token = await user.getIdToken();

        const data = { uid: user.uid, name, birthday, imageUrl, shift_name };

        await this.http.post(
          `${this.baseUrl}/users/register/`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        ).toPromise();

        return true;
      }
      console.error('Error durante el registro:', error);
      throw error;
    }
  }

  monitorUserActivity() {
    window.addEventListener('mousemove', () => this.resetIdleTime());
    window.addEventListener('keydown', () => this.resetIdleTime());
    window.addEventListener('click', () => this.resetIdleTime());
    window.addEventListener('touchstart', () => this.resetIdleTime());
  }

  startSessionTimer() {
    const sessionDuration = 30 * 60 * 1000; // 30 minutos
    setTimeout(() => {
      this.logOut();
    }, sessionDuration);
  }

  handleAuthState() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.monitorUserActivity();  // Monitorea la actividad después del inicio de sesión
        this.startIdleTimer();       // Inicia el temporizador de inactividad
        this.startSessionTimer();    // Inicia el temporizador de sesión fija
      }
    });
  }

  getRanking(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/ranking`);
  }


  getRewards(levelId: string): Observable<any>{
    const url = `${this.baseUrl}/users/rewards/${levelId}`;
    return this.http.get(url);
  }

  checkUserLevel(employee: string): Observable<any>{
    return this.http.get(`${this.baseUrl}/users/check-level/${employee}`);
  }

  getTopLevelStatus(levelId: string): Observable<{ isTopLevel: boolean }> {
    return this.http.get<{ isTopLevel: boolean }>(`${this.baseUrl}/users/top-level-status/${levelId}`);
  }

  resetMonthlyPoints(){
    const url = `${this.baseUrl}/users/reset-monthly-points`;
    return this.http.get(url);
  }

  listEmployeesWithShift(): Observable<EmployeeWithShift[]> {
  return this.http
    .get<{ employees: any[] }>(`${this.baseUrl}/users/employees-with-shift`)
    .pipe(
      map(resp => {
        const arr = resp?.employees ?? [];
        return arr.map((e: any) => {
          const s = e?.shift || null;

          return new EmployeeWithShift({
            uid: String(e?.uid ?? ''),
            name: String(e?.name ?? 'Employee'),
            role: 'employee',
            shift: s
              ? new Shift(
                  String(s.start_time ?? ''),
                  String(s.end_time ?? ''),
                  '',
                  String(s.name ?? ''),
                  (s.id as any)
                )
              : null,
          });
        });
      })
    );
  }


}

