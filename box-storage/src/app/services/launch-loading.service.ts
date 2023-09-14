import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LaunchLoadingService {

  /**
   * get_files_on_dashboard
   * check_code
   * download_file
   * get_file_link
   * delete_file
   * upload_file
   * 
   *    */

  subject: Subject<{key: string, value: any}> = new Subject<{key: string, value: string}>();

  constructor() { }
}
