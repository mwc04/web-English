import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakingChatComponent } from './speaking-chat.component';

describe('SpeakingChatComponent', () => {
  let component: SpeakingChatComponent;
  let fixture: ComponentFixture<SpeakingChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeakingChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakingChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
