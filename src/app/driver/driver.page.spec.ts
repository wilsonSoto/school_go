// import { DriverPage } from './driver.page';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { DriverPage } from './driver.page';

describe('Tab2Page', () => {
  let component: DriverPage;
  let fixture: ComponentFixture<DriverPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DriverPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DriverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
