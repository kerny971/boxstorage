import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../environments/environment.development';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'box-storage';
  baseUrl: String = environment.apiUrl;
  redirectAfterLogout = environment.host;

  constructor (private authService: AuthService, private router: Router) {}


}
