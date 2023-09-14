import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LaunchLoadingService } from 'src/app/services/launch-loading.service';
import { RecordUserService } from 'src/app/services/record-user.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form: FormGroup;
  loginLoaded: boolean = true;
  resLogin: any = null;
  statusLogin: boolean = false;
  redirectUrlLogin: string = environment.host + environment.dashboardRoute;
  showPassword: boolean = false;
  showError: boolean = false;


  constructor (private authService: AuthService, private router: Router, private recordUser: RecordUserService, private launchLoading: LaunchLoadingService, private _snackbar: MatSnackBar) {
    this.form = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,64}$/)
      ]),
      password: new FormControl('', [
        Validators.required
      ])
    });

  }

  login (event: any) {
    const val = this.form.value;
    if (val.email && val.password) {
      this.loginLoaded = false;
      this.authService.login(val.email, val.password)
        .subscribe({
          next: (res: any) => {
            this.loginLoaded = true;
            const expiresAt = +res.expiresIn;
            localStorage.setItem('id_token', res.idToken);
            localStorage.setItem('user', JSON.stringify(res.data.results));
            localStorage.setItem('expires_at', JSON.stringify(expiresAt));
            this.resLogin = res;
            this.statusLogin = true;
          },
          error: (res: any) => {
            this.openSnackbar(res.error.errors.message, 'Fermer');
            this.loginLoaded = true;
            this.resLogin = res;
            // this.showError = this.resLogin.error.errors ? true : false;
          },
          complete: (res: any) => {
            setTimeout(() => {
              window.location.href = this.redirectUrlLogin;
            }, 1500)
          }
        });
    }
  }

  getErrorList(errorObject: any) {
    const error = String(Object.keys(errorObject)[0])
    return error;
  }

  openSnackbar(message: string, action: string) {
    this._snackbar.open(message, action, {
      duration: 3000
    })
  }

  toggleShowPassword () {
    this.showPassword = !this.showPassword;
  }

}
