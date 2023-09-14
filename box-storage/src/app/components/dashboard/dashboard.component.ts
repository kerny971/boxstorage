import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { GetFilesService } from 'src/app/services/get-files.service';
import { LaunchLoadingService } from 'src/app/services/launch-loading.service';
import { SharedFilesService } from 'src/app/services/shared-files.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

  user: any = {};
  redirectAfterLogout = environment.host;
  loading: Map<string, any> = new Map<string, any>();
  files: any = [];
  intervalCodeValidationDuration: any = undefined;
  codeValidationSubmitted: string = "";
  timeValidationSubmitted: number = 0;
  hoursRemaining: number = 0;
  minutesRemaining: number = 0;
  secondsRemaining: number = 0;

  constructor (private authService: AuthService, private filesService: GetFilesService, private sharedFilesService: SharedFilesService, private launchLoading: LaunchLoadingService) {
    this.sharedFilesService.subject.subscribe((data: any) => {
      this.files = data;
    })

    this.launchLoading.subject.subscribe((data: {key: string, value: any}) => {
      if (this.loading.has(data.key) && data.value.loaded) {
        this.loading.delete(data.key)
      } 
      
      if (!(this.loading.has(data.key)) && !(data.value.loaded)) {
        this.loading.set(data.key, data.value)
      }
    })
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.launchLoading.subject.next({
      key: "get_files_on_dashboard",
      value : { loaded: false }
    })
    this.filesService.get()
      .subscribe({
        next: (res: any) => {
          this.files = res.result;
          this.launchLoading.subject.next({
            key: "get_files_on_dashboard",
            value : { loaded: true }
          })
        },
        error: (res: any) => {
          this.launchLoading.subject.next({
            key: "get_files_on_dashboard",
            value : { loaded: true }
          })
        }
      });
  }

  logout () : void {
    this.authService.logout();
    window.location.href = this.redirectAfterLogout;
  }

  checkCode (): void {
    this.launchLoading.subject.next({
      key: "check_code",
      value : { loaded: false }
    })
    this.authService.sendConfirmationCode().subscribe({
      next: (res: any) => {
        this.timeValidationSubmitted = res.date;
        const convertSeconds = this.convertSecondsToMinutes(this.timeValidationSubmitted);
        this.hoursRemaining = convertSeconds.hours;
        this.minutesRemaining = convertSeconds.minutes;
        this.secondsRemaining = convertSeconds.seconds;

        this.intervalCodeValidationDuration = setInterval(() => {
          this.timeValidationSubmitted--;
          const convertSeconds = this.convertSecondsToMinutes(this.timeValidationSubmitted);
          this.hoursRemaining = convertSeconds.hours;
          this.minutesRemaining = convertSeconds.minutes;
          this.secondsRemaining = convertSeconds.seconds;
          if (this.timeValidationSubmitted <= 0) {
            clearInterval(this.intervalCodeValidationDuration)
          }
        }, 1000);

        this.launchLoading.subject.next({
          key: "check_code",
          value : { loaded: true }
        })
      },

      error: (res: any) => {
        this.launchLoading.subject.next({
          key: "get_files_on_dashboard",
          value : { loaded: true }
        })
      }
    })

  }

  convertSecondsToMinutes (seconds: number): {hours: number, minutes: number, seconds: number} {
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60); // 600 sec -> 10 min -> 10 : 00
    const secondes = seconds % 60;
    return { hours, minutes, seconds: secondes }
  }

}
