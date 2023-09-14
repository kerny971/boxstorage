import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { LaunchLoadingService } from 'src/app/services/launch-loading.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit, OnChanges {
  
  selectedFiles: FileList | undefined;
  currentFile: File | undefined = undefined;
  progress: number = 0;
  message: string = '';
  @Input() files: any = [];
  @Output() filesChange = new EventEmitter<any>();
  showError: boolean = false;
  filesSize: number = 0;
  maxFilesSize: number = +environment.maxFilesSize;

  requestUploadFile: any = null;


  constructor (private uploadService: UploadFileService, private launchLoading: LaunchLoadingService, private _snackbar: MatSnackBar) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    if (changes['files'].currentValue || changes['files'].previousValue) {
      this.filesSize = 0;
      Array.from(this.files).forEach((f: any) => {
        this.filesSize += f.size;
      })
    }
  }

  ngOnInit(): void {
  }
  

  selectFile (event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      let futureSize: number = 0;
      Array.from(files).map((f: any) => {
        futureSize += Number(f.size)
      })

      futureSize += this.filesSize
      
      if ( futureSize < environment.maxFilesSize) {
        this.selectedFiles = files;
        this.openSnackbar(this.selectedFiles?.length + ' fichier(s) en attente d\'envoi...', 'Fermer');
      } else {
        this.selectedFiles = undefined;
        this.showError = true;
        this.openSnackbar('Votre espace de stockage est saturée...', 'Fermer');
      }
    }
  }

  cancelUpload () {
    console.log(this.requestUploadFile);
    if (this.progress < 99) {
      this.openSnackbar('Sauvegarde de ' + (this.selectedFiles?.length ?? '') + ' fichier(s) annulé(s)', 'Fermer');
      this.requestUploadFile.unsubscribe();
      this.progress = 0;
      this.launchLoading.subject.next({
        key: "upload_file",
        value : { loaded: true }
      })
      this.currentFile = undefined;
      this.showError = false;
    }
  }

  upload (): void {
    this.progress = 0;
    this.currentFile = this.selectedFiles?.item(0) || undefined;
    if (this.selectedFiles !== undefined) {
      this.launchLoading.subject.next({
        key: "upload_file",
        value : { loaded: false }
      })
      this.requestUploadFile = this.uploadService.upload(this.selectedFiles).subscribe({
        next: (res: any) => {
          if (res.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(100 * res.loaded / (res.total ? res.total : 1))
          } else if (res instanceof HttpResponse) {
            console.log(res);
            this.launchLoading.subject.next({
              key: "upload_file",
              value : { loaded: true }
            })
            if (res.status >= 200 && res.status < 300) {
              res.body.files.forEach((f: any) => {
                this.files.unshift(f)
              })
              this.filesChange.emit(this.files);
              res.body.message = "Ce fichier à été enregistrer !";
              this.filesSize = 0;
              Array.from(this.files).forEach((f: any) => {
                this.filesSize += f.size;
              })
              this.openSnackbar(this.selectedFiles!.length + " fichier(s) sauvegardé", 'Fermer');
            }
            this.currentFile = undefined;
            this.message = res.body.message;
            this.showError = false;
            this.selectedFiles = undefined;
          }
        },
        error: (res: any) => {
          this.progress = 0;
          this.launchLoading.subject.next({
            key: "upload_file",
            value : { loaded: true }
          })
          this.message = res.error.message ?? "Ce fichier ne peut être envoyée...";
          this.currentFile = undefined;
          this.selectedFiles = undefined;
          this.showError = true;
          this.openSnackbar(res.error.message ?? "ce fichier ne peut-être envoyé...", 'Fermer');
        }
      });
    }
  }

  openSnackbar(message: string, action: string) {
    this._snackbar.open(message, action, {
      duration: 3000
    })
  }
  
}
