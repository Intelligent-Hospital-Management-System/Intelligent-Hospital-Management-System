import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);

    public user$: Observable<User | null> = user(this.auth);

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