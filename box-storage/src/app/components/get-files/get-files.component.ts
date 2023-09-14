import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GetFilesService } from 'src/app/services/get-files.service';

@Component({
  selector: 'app-get-files',
  templateUrl: './get-files.component.html',
  styleUrls: ['./get-files.component.css']
})
export class GetFilesComponent {

  @Input() files: any = null;
  @Output() filesChange = new EventEmitter<any>();

  constructor (private getFilesService: GetFilesService) {}
  
}
