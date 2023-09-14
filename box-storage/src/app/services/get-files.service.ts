import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GetFilesService implements OnInit {

  private baseUrl = environment.apiUrl;
  private fileUri = environment.fileUrl;
  private deleteUriFile = environment.deleteFileUrl;
  private downloadUri = environment.downloadUrl;
  token: string | null = '';

  constructor(private http: HttpClient, private authService: AuthService) { }
  ngOnInit(): void {
    this.token = this.authService.getToken()
  }

  get () : any {
    return this.http.get(`${this.baseUrl + this.fileUri}`);
  }

  downloadFile (id: number) : any {
    return this.http.post(this.baseUrl + this.downloadUri + id, {});
  }

  downloadFromAPI (url: string) {

    const req = new HttpRequest('GET', url, null, {
      reportProgress: true,
      responseType: 'blob' as 'json'
    });

    return this.http.request(req);
  }

  deleteFile (id: number) {
    return this.http.delete(this.baseUrl + this.deleteUriFile + "/" + id)
  }
  
}
