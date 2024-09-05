import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { auth } from '../services/firebaseconfig';  // Import Firebase auth
import { signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})

export class UserService {

  private baseUrl = 'http://127.0.0.1:8000';  //URL de Backend

  constructor(private http: HttpClient) { }

  async login(user: User): Promise<String> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
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
