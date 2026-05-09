import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  // Mock user info
  user = {
    name: 'Flor Varela',
    role: 'Administrador',
    email: 'flor.varela@hospital.com',
    profilePic: 'https://i.pravatar.cc/150?u=florvarela'
  };

  // App Info
  appInfo = {
    name: 'Intelligent Hospital Management System (IHMS)',
    version: '1.0.0',
    userAgent: ''
  };

  constructor(private router: Router) { }

  ngOnInit() {
    this.appInfo.userAgent = navigator.userAgent;
  }

  logout() {
    const confirmLogout = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmLogout) {
      sessionStorage.removeItem('isLoggedIn');
      this.router.navigate(['/login']);
    }
  }
}
