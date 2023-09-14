import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetFilesComponent } from './get-files.component';

describe('GetFilesComponent', () => {
  let component: GetFilesComponent;
  let fixture: ComponentFixture<GetFilesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetFilesComponent]
    });
    fixture = TestBed.createComponent(GetFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
