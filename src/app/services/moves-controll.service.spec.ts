import { TestBed } from '@angular/core/testing';

import { MovesControllService } from './moves-controll.service';

describe('MovesControllService', () => {
  let service: MovesControllService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovesControllService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
