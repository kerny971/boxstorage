import { Directive } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Directive({
  selector: '[appEmailValidator]'
})
export class EmailValidatorDirective {

  static emailValidator(authService: AuthService): AsyncValidatorFn {
    return (control: AbstractControl): any => {
      return authService.emailIsAvailable(control.value).pipe(
        map(
          (result: any) => {
            return result.statusCode === 0 ? null : { checkEmailValidator : true }
          },
        )
      );
    };
  }

}
