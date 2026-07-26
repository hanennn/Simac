import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesDepenses } from './mes-depenses';

describe('MesDepenses', () => {
  let component: MesDepenses;
  let fixture: ComponentFixture<MesDepenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesDepenses],
    }).compileComponents();

    fixture = TestBed.createComponent(MesDepenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
