import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Simple pre-bootstrap fetch for runtime config JSON. We store it on window so
// services can access it synchronously during app initialization if needed.
function loadRuntimeConfig(): Promise<void> {
  return fetch('assets/config/runtime-config.json')
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch runtime config: ${res.status}`);
      return res.json();
    })
    .then((cfg) => {
      // store on window for global access
      (window as any).__RUNTIME_CONFIG__ = cfg || {};
    })
    .catch((err) => {
      console.error('Could not load runtime config, using defaults:', err);
      (window as any).__RUNTIME_CONFIG__ = {};
    });
}

loadRuntimeConfig()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error('Bootstrap error:', err));
