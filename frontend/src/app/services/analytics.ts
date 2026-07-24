import { Injectable } from '@angular/core';
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  sendEvent(eventName: string, params: Record<string, unknown> = {}): void {
    window.gtag?.('event', eventName, params);
  }

  loginSuccess(email: string): void {
    this.sendEvent('login_success', {
      user_email: email,
    });
  }

  patientsViewOpened(): void {
    this.sendEvent('patients_view_opened');
  }

  dashboardViewed(): void {
    this.sendEvent('dashboard_viewed');
  }
}
