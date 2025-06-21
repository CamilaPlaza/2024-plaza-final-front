import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { auth } from '../services/firebaseconfig';  // Import Firebase auth
import { signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, UserCredential, User, onAuthStateChanged, setPersistence, browserSessionPersistence, signOut, confirmPasswordReset } from 'firebase/auth';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class LevelService {
  //private baseUrl = 'https://candv-back.onrender.com';
  private baseUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) { }

  getLevel(levelId: string):Observable<string>{
    const endpoint = `${this.baseUrl}/users/level/${levelId}`;  // Construct the URL
    return this.http.get<string>(endpoint);
  }
}
