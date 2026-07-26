import { TestBed } from '@angular/core/testing';

import { Depense } from './depense';

describe('Depense', () => {
  let service: Depense;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Depense);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
