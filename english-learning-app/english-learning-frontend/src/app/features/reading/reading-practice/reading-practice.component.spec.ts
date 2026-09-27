import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingPracticeComponent } from './reading-practice.component';

describe('ReadingPracticeComponent', () => {
  let component: ReadingPracticeComponent;
  let fixture: ComponentFixture<ReadingPracticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingPracticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadingPracticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
