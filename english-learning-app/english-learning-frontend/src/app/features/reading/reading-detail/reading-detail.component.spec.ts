import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingDetailComponent } from './reading-detail.component';

describe('ReadingDetailComponent', () => {
  let component: ReadingDetailComponent;
  let fixture: ComponentFixture<ReadingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
