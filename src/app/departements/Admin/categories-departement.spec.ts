import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesDepartement } from './categories-departement';

describe('CategoriesDepartement', () => {
  let component: CategoriesDepartement;
  let fixture: ComponentFixture<CategoriesDepartement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesDepartement],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesDepartement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
