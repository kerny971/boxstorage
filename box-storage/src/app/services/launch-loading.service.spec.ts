import { TestBed } from '@angular/core/testing';

import { LaunchLoadingService } from './launch-loading.service';

describe('LaunchLoadingService', () => {
  let service: LaunchLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LaunchLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
