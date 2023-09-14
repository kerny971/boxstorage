import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  @Input() type: string = 'dark';
  @Input() message: string = "Un évènement s'est produit...";

  @Input() errorShow: boolean = true;
  @Output() errorShowChange = new EventEmitter<boolean>();

  ngOnInit(): void {}

  showError () {
    this.errorShow = false;
    this.errorShowChange.emit(this.errorShow);
  }

}
