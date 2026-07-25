import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: 'https://3d296010514015858c4d1872ee3e068c@o4511699872317440.ingest.us.sentry.io/4511699883589632',
  release: 'ihms@1.0.0',
  debug: true,
});
bootstrapApplication(App, appConfig).catch((error) => {
  Sentry.captureException(error);
  console.error(error);
});
