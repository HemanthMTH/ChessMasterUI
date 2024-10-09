import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerStripComponent } from './player-strip.component';

describe('PlayerStripComponent', () => {
  let component: PlayerStripComponent;
  let fixture: ComponentFixture<PlayerStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerStripComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerStripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
