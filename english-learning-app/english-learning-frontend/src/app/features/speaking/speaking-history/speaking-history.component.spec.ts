import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakingHistoryComponent } from './speaking-history.component';

describe('SpeakingHistoryComponent', () => {
  let component: SpeakingHistoryComponent;
  let fixture: ComponentFixture<SpeakingHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeakingHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakingHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
