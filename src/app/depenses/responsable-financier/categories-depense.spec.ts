import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesDepense } from './categories-depense';

describe('CategoriesDepense', () => {
  let component: CategoriesDepense;
  let fixture: ComponentFixture<CategoriesDepense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesDepense],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesDepense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
