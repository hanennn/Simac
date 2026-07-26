import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDepenses } from './validation-depenses';

describe('ValidationDepenses', () => {
  let component: ValidationDepenses;
  let fixture: ComponentFixture<ValidationDepenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationDepenses],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationDepenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
