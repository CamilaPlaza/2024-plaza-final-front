import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { auth } from '../services/firebaseconfig';  // Import Firebase auth
import { signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})

export class UserService {

  private baseUrl = 'http://127.0.0.1:8000';  //URL de Backend
  idleTime: number = 0;
  maxIdleTime: number = 10 * 60 * 1000; // 10 minutos de inactividad
  idleInterval: any;

  constructor(private http: HttpClient) { }

  async onRegister(email: string, password: string, name: string, birthday: Date): Promise<string> {
    try {

      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Usuario creado exitosamente:', firebaseUser);
      
      // Preparar los datos adicionales para enviar al backend
      const data = {
        uid: firebaseUser.uid,
        name: name,
        birthday: birthday
      };
      console.log(this.http.post(`${this.baseUrl}/register/`, data));
      await this.http.post(`${this.baseUrl}/register/`, data).toPromise();
      console.log('Datos adicionales guardados en Firestore');
      return "true";
    } catch (error: any) {
      console.error('Error durante el registro:', error);
      return "false";
    }
  }
  
  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed in:', user);
      return true; // Inicio de sesión exitoso
    } catch (error) {
      console.error('Error during login:', error);
      return false; // Error en el inicio de sesión
    }
  }
  
  
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent!');
    } catch (error: any) {
      console.error('Error sending password reset email:', error.message);
    }
  }

  deleteCurrentUser(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      return deleteUser(user)
        .then(() => {
          console.log('User deleted successfully');
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
          throw error;
        });
    } else {
      return Promise.reject('No user is currently logged in');
    }
  }
  startIdleTimer() {
    this.idleInterval = setInterval(() => {
      this.idleTime += 1000;
      if (this.idleTime >= this.maxIdleTime) {
        this.signOut();
      }
    }, 1000);
  }

  // Resetea el tiempo de inactividad al detectar actividad del usuario
  resetIdleTime() {
    this.idleTime = 0;
  }

  // Cerrar sesión
  signOut() {
      auth.signOut().then(() => {
        clearInterval(this.idleInterval);
        console.log('Sesión cerrada correctamente');
      }).catch((error) => {
        console.error('Error al cerrar la sesión:', error);
      });
    }
  // Monitorea la actividad del usuario (para resetear el temporizador de inactividad)
  monitorUserActivity() {
    window.addEventListener('mousemove', () => this.resetIdleTime());
    window.addEventListener('keydown', () => this.resetIdleTime());
    window.addEventListener('click', () => this.resetIdleTime());
    window.addEventListener('touchstart', () => this.resetIdleTime());
  }

  // Inicia el temporizador de sesión fija
  startSessionTimer() {
    const sessionDuration = 30 * 60 * 1000; // 30 minutos
    setTimeout(() => {
      this.signOut();
    }, sessionDuration);
  }

  // Maneja el estado de autenticación
  handleAuthState() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.monitorUserActivity();  // Monitorea la actividad después del inicio de sesión
        this.startIdleTimer();       // Inicia el temporizador de inactividad
        this.startSessionTimer();    // Inicia el temporizador de sesión fija
      }
    });
  }

}
