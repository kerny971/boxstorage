import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, AsyncValidator, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, ObservableInput, catchError, map, switchMap, timer } from 'rxjs';
import { EmailValidatorDirective } from 'src/app/directives/email-validator.directive';
import { PseudoValidatorDirective } from 'src/app/directives/pseudo-validator.directive';
import { AuthService } from 'src/app/services/auth.service';
import { RecordUserService } from 'src/app/services/record-user.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  signUpLoaded: boolean = true;
  formSignUp: FormGroup;
  res: any = null;
  statusSignup: boolean = false;
  pseudoSize: number = 0;
  passwordSize: number = 0;
  endpointCheckPseudo: string = environment.apiUrl + environment.checkPseudoUrl;
  showPassword: boolean = false;
  showError: boolean = false;


  constructor (private authService: AuthService, private router: Router, private recordUser: RecordUserService, private http: HttpClient, private _snackbar: MatSnackBar) {
    this.formSignUp = new FormGroup({
      pseudo: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
        Validators.minLength(3),
        Validators.maxLength(33),
      ],
      [
        PseudoValidatorDirective.pseudoValidator(this.authService)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,64}$/),
      ],
      [
        EmailValidatorDirective.emailValidator(this.authService)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/),
        Validators.maxLength(64),
        Validators.minLength(12),
      ])
    });

  }

  signup (event: any) {
    const val = this.formSignUp.value;
    if (val.email && val.password && val.pseudo) {
      this.signUpLoaded = false;
      this.recordUser.save(val.pseudo, val.email, val.password)
      .subscribe({
        next: (res: any) => {
           this.res = res;
           this.signUpLoaded = true;
           this.statusSignup = true;
        },
        error: (res: any) => {
          this.openSnackbar(res.error.errors.message, 'Fermer');
          this.res = res;
          this.signUpLoaded = true;
        }
      });
    }
  }

  pseudoLength (event: any) {
    this.pseudoSize = event.target.value.length;
  }

  passwordLength (event: any) {
    this.passwordSize = event.target.value.length;
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
