import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = signal(false);

  constructor(private router: Router) {
    // If already logged in, redirect to main
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
      this.router.navigate(['/main/items']);
    }
  }

  login() {
    this.isLoading.set(true);
    
    // Simulate API call for 2 seconds
    setTimeout(() => {
      sessionStorage.setItem('isLoggedIn', 'true');
      this.isLoading.set(false);
      this.router.navigate(['/main/items']);
    }, 2000);
  }
}
