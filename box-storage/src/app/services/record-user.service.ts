import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RecordUserService {

  endpoints: string = environment.apiUrl + environment.signupUrl;

  constructor(private http: HttpClient) { }

  save (pseudo: string, email: string, password: string) : any {
    return this.http.post<any>(this.endpoints, {pseudo, email, password})
  }


  setUser (res: any) {
    return res;
  }

  setError (res: any) {
    return res;
  }

}
