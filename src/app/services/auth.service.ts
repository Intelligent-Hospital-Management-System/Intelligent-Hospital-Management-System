import { Injectable } from '@angular/core';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { Observable, map } from 'rxjs';

export interface AuthUser {
  name: string;
  email: string;
  photoUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();

  public user$: Observable<AuthUser | null> = new Observable((observer) => {
    const unsubscribe = onAuthStateChanged(this.auth, (currentUser) => {
      if (!currentUser) {
        observer.next(null);
        return;
      }

      observer.next({
        name: currentUser.displayName ?? 'Usuario',
        email: currentUser.email ?? '',
        photoUrl: currentUser.photoURL
          ? `${currentUser.photoURL}?sz=150`
          : '/img/default-avatar.png',
      });
    });
    return unsubscribe;
  });
  public isLogged$: Observable<boolean> = this.user$.pipe(map((user) => user !== null));
  constructor() {}

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  logout = () => signOut(this.auth);
}
