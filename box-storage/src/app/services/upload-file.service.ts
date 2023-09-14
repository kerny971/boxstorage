import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  private baseUrl = environment.apiUrl;
  private uploadUri = environment.uploadUrl;

  constructor(private http: HttpClient) { }

  upload (file: FileList): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    Array.from(file).forEach((f) => {
      formData.append('files', f)
    })

    const req = new HttpRequest('POST', `${this.baseUrl + this.uploadUri}`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFiles () : Observable<any> {
    return this.http.get(`${this.baseUrl + 'test/files'}`);
  }

}
