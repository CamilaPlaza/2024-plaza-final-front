import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { auth } from '../services/firebaseconfig';  // Import Firebase auth
import { signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})

export class UserService {

  private baseUrl = 'http://127.0.0.1:8000';  //URL de Backend

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
  

  async login(email: string, password: string): Promise<String> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully:', userCredential.user);
      return "true";
    } catch (error: any) {
      console.error('Error logging in:', error);
      return "false";
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
}
