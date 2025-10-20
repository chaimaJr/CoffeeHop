import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaristaHomePage } from './barista-home.page';

describe('BaristaHomePage', () => {
  let component: BaristaHomePage;
  let fixture: ComponentFixture<BaristaHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BaristaHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
