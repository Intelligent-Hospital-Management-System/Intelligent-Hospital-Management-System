import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  private router = inject(Router);

  userProfile = {
    phone: '',
    address: '',
    birthdate: '',
  };

  ngOnInit() {
    const savedProfile = localStorage.getItem('userProfile');

    if (savedProfile) {
      this.userProfile = JSON.parse(savedProfile);
    }
  }

  saveProfile() {
    localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
    this.router.navigate(['/main/config']);
  }
}
