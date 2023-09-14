import { Directive } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Directive({
  selector: '[appPseudoValidator]'
})
export class PseudoValidatorDirective {

  static pseudoValidator(authService: AuthService): AsyncValidatorFn {
    return (control: AbstractControl): any => {
      return authService.pseudoIsAvailable(control.value).pipe(
        map(
          (result: any) => {
            return result.statusCode === 0 ? null : { checkPseudoValidator : true }
          },
        )
      );
    };
  }

}
