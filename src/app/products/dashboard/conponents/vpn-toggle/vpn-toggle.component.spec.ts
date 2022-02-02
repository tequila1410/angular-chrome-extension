import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VpnToggleComponent } from './vpn-toggle.component';

describe('VpnToggleComponent', () => {
  let component: VpnToggleComponent;
  let fixture: ComponentFixture<VpnToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VpnToggleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VpnToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
