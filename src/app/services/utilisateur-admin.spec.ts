import { TestBed } from '@angular/core/testing';

import { UtilisateurAdmin } from './utilisateur-admin';

describe('UtilisateurAdmin', () => {
  let service: UtilisateurAdmin;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilisateurAdmin);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
