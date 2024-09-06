import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarroselcardComponent } from './carrosel-card.component';

describe('CarroselcardComponent', () => {
  let component: CarroselcardComponent;
  let fixture: ComponentFixture<CarroselcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarroselcardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CarroselcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
