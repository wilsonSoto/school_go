import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
// import { RentalHistoryComponent } from '../rental-history/rental-history.component'
const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: 'tab4',
        loadChildren: () => import('../tab4/tab4.module').then(m => m.Tab4PageModule)
      },
      // {
      //   path: 'report',
      //   loadChildren: () => import('../report-and-statistics/report-and-statistics.module').then(m => m.ReportAndStatisticsModule)
      // },
      // {
      //   path: 'history',
      //   loadChildren: () => import('../rental-history/rental-history.module').then(m => m.RentalHistoryModule)
      // },
      // {
      //   path: 'register',
      //   loadChildren: () => import('../register/register.module').then(m => m.RentalHistoryModule)
      // },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'tabs/tab1',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
