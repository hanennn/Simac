import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonBudget } from './mon-budget';

describe('MonBudget', () => {
  let component: MonBudget;
  let fixture: ComponentFixture<MonBudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonBudget],
    }).compileComponents();

    fixture = TestBed.createComponent(MonBudget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
