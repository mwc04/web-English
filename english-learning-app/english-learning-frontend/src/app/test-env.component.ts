import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-test-env',
  template: `<p>API URL: {{ apiUrl }}</p>`
})
export class TestEnvComponent {
  apiUrl = environment.apiUrl;
}