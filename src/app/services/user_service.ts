import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { auth } from '../services/firebaseconfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, UserCredential, User, onAuthStateChanged, setPersistence, browserSessionPersistence, signOut, confirmPasswordReset } from 'firebase/auth';
import { Observable, BehaviorSubject  } from 'rxjs';

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

   constructor(private http: HttpClient) { }

  async login(email: string, password: string): Promise<boolean> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user?.uid;
    console.log("uid", uid); // este puede quedar, NO imprime el token

    this.currentUser = userCredential.user;

    if (uid) {
      const userData = await this.fetchUserData(uid);
      userData.uid = uid;
      this.currentUserData = userData;
      this.currentUserData$.next(userData);
      console.log('User data desde backend:', userData);
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

  logOut(){
    return signOut(auth)
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
    return confirmPasswordReset(auth, oobCode, newPassword);}

  async deleteCurrentUser(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      this.http.delete(`${this.baseUrl}/users/deleteByID/${user.uid}`).toPromise();
      try {
        await deleteUser(user);
        console.log('User deleted successfully');
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



  async onRegister(email: string, password: string, name: string, birthday: string, imageUrl: string): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Usuario creado exitosamente:', firebaseUser);

      const token = await firebaseUser.getIdToken();
      console.log('Token JWT tras registro:', token);  // <-- Acá ves el token en consola

      const data = {
        uid: firebaseUser.uid,
        name: name,
        birthday: birthday,
        imageUrl: imageUrl
      };

      await this.http.post(`${this.baseUrl}/users/register/`, data).toPromise();
      return true;
    } catch (error: any) {
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

}

