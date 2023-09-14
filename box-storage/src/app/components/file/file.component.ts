import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, Subscription } from 'rxjs';
import { GetFilesService } from 'src/app/services/get-files.service';
import { LaunchLoadingService } from 'src/app/services/launch-loading.service';
import { SharedFilesService } from 'src/app/services/shared-files.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {

  @Input() file: any;
  @Input() files: any;
  @Output() filesChange = new EventEmitter<any>();

  shareUrl: string = '';
  timeRemaining: number = environment.fileLinkTimeDisplayed;
  progress: number = 0;
  blob!: Blob;
  tInterval: any;
  tTimeout: any;
  error: boolean = false;
  res: any;

  requestDownloadFile: any = null;

  constructor (private getFilesService: GetFilesService, private sharedFilesService: SharedFilesService, private launchLoading: LaunchLoadingService, private _snackbar: MatSnackBar) {}

  ngOnInit(): void {
    this.file.sizeEdit = this.formatOctet(+this.file.size);
  }

  formatOctet (bytes: number, decimals: number = 2): any {
    if (!+bytes) return '0 Octet'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Octet', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  cancelDownload () {
    if (this.progress < 99) {
      this.openSnackbar('Téléchargment ' + this.file.original_name + ' annulée...', 'Fermer');
      this.requestDownloadFile.unsubscribe()
      this.launchLoading.subject.next({
        key: "download_file_" + this.file.id,
        value : { loaded: true }
      })
      this.progress = 0;
    }
  }

  downloadFile () {
    const url = this.file.host + this.file.uri_download;
    this.launchLoading.subject.next({
      key: "download_file_" + this.file.id,
      value : { loaded: false }
    })
    this.requestDownloadFile = this.getFilesService.downloadFromAPI(url).subscribe({
      next: (res: any) => {
        if (res.type === HttpEventType.DownloadProgress) {
          if (res.total) {
            this.progress = Math.round(100 * res.loaded / res.total)
          }
        } else if (res instanceof HttpResponse) {
          if (res.status >= 200 && res.status < 300) {
            this.blob = new Blob([res.body], {type: this.file.type});
            const downloadURL = window.URL.createObjectURL(res.body);
            const link = document.createElement('a');
            link.href = downloadURL;
            link.download = this.file.original_name;
            link.click();
            this.openSnackbar(this.file.original_name + ' a été téléchargé', 'Fermer');
            const tOut = setTimeout(() => {
              this.progress = 0;
            }, 2000);
          }
          this.launchLoading.subject.next({
            key: "download_file_" + this.file.id,
            value : { loaded: true }
          })
        }
      },
      error: (res: any) => {
        this.progress = 0;
        this.openSnackbar(this.file.original_name + ' échec du téléchargement', 'Fermer');
        this.launchLoading.subject.next({
          key: "download_file_" + this.file.id,
          value : { loaded: true }
        })
      }
    })
  }

  getFiles () {
    const id = this.file.id;
    let url = this.file.host + this.file.uri;
    this.shareUrl = '';
    clearInterval(this.tInterval);
    clearTimeout(this.tTimeout);
    this.timeRemaining =  environment.fileLinkTimeDisplayed;
    this.launchLoading.subject.next({
      key: "get_file_link_" + this.file.id,
      value : { loaded: false }
    })
    this.getFilesService.downloadFile(id).subscribe({
      next: (res: any) => {
        url += "?code=" + res.data.code;
        this.shareUrl = url;
        this.tInterval = setInterval(() => {
          this.timeRemaining -= 1000;
        }, 1000)
        this.tTimeout = setTimeout(() => {
          this.shareUrl = '';
        }, environment.fileLinkTimeDisplayed)
        this.launchLoading.subject.next({
          key: "get_file_link_" + this.file.id,
          value : { loaded: true }
        })
        this.openSnackbar(this.file.original_name + ' lien de partage générer', 'Fermer');
      },
      error: (res: any) => {
        this.launchLoading.subject.next({
          key: "get_file_link_" + this.file.id,
          value : { loaded: true }
        })
        this.openSnackbar(this.file.original_name + ' lien de partage indisponible', 'Fermer');
      }
    })
  }

  removeShareUrl () {
    navigator.clipboard.writeText(this.shareUrl);
    const tOut = setTimeout(() => {
      this.shareUrl = "";
      clearTimeout(tOut);
    }, 250)
  }

  deleteFiles () {
    this.launchLoading.subject.next({
      key: "delete_file_" + this.file.id,
      value : { loaded: false }
    })
    this.getFilesService.deleteFile(+this.file.id).subscribe({
      next: (res: any) => {
        this.files = this.files.filter((file: any) => file.id != this.file.id)
        this.error = false;
        this.res = res;
        this.filesChange.emit(this.files);
        this.sharedFilesService.subject.next(this.files);
        this.launchLoading.subject.next({
          key: "delete_file_" + this.file.id,
          value : { loaded: true }
        })
        this.openSnackbar('Fichier ' + this.file.original_name + ' supprimée', 'Fermer');
      },
      error: (res: any) => {
        this.error = true;
        this.res = res;
        this.launchLoading.subject.next({
          key: "delete_file_" + this.file.id,
          value : { loaded: true }
        })
        this.openSnackbar(this.file.original_name + ' Erreur lors de la suppression', 'Fermer');
      }
    })
  }

  openSnackbar(message: string, action: string) {
    this._snackbar.open(message, action, {
      duration: 3000
    })
  }
}
