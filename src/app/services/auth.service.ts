import { Injectable } from '@angular/core';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = getAuth();

    public user$: Observable<User | null> = new Observable(subscriber => {
        const unsubscribe = onAuthStateChanged(this.auth, subscriber);
        return unsubscribe;
    });

    constructor() { }

    async loginWithGoogle(): Promise<void> {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(this.auth, provider);
        } catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await signOut(this.auth);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    }
}