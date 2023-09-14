import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  endpoints: string = environment.apiUrl + environment.loginUrl;
  endpointCheckPseudo: string = environment.apiUrl + environment.checkPseudoUrl;
  endpointCheckEmail: string = environment.apiUrl + environment.checkEmailUrl;
  endpointSendConfirmationEmail: string = environment.apiUrl + environment.sendConfirmEmailUrl;

  constructor(private http: HttpClient) {}

  login (email: string, password: string) : any {
    return this.http.post<any>(this.endpoints, {email, password});
  }

  logout (): void {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user');
  }

  isLoggedIn (): boolean {
    const expiration = this.getExpiration();
    console.log('is logged :' + expiration);
    if (expiration) {
      return moment().isBefore(expiration);
    }else {
      return false;
    }
  }

  getUser (): object {
    return JSON.parse(localStorage.getItem('user') ?? '{}');
  }

  getToken (): string | null {
    return localStorage.getItem('id_token');
  }

  getExpiration () {
    const expiration = localStorage.getItem("expires_at");

    if (expiration) {
      const expiresAt = +expiration;
      return moment.unix(expiresAt);
    } else {
      return null;
    }
  }

  pseudoIsAvailable (pseudo: string): any {
    return this.http.post(this.endpointCheckPseudo, {pseudo})
  }

  emailIsAvailable (email: string): any {
    return this.http.post(this.endpointCheckEmail, {email})
  }

  sendConfirmationCode () {
    return this.http.post(this.endpointSendConfirmationEmail, {})
  }

}

