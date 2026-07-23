import { TestBed } from '@angular/core/testing';

import { Departement } from './departement';

describe('Departement', () => {
  let service: Departement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Departement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
