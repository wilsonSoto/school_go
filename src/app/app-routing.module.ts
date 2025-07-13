import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AddClientComponent } from './Components/add-client/add-client.component';
import { AddRouteComponent } from './Components/add-route/add-route.component';
import { MapsComponent } from './Components/actions-services/maps-route/maps-route.component';
import { AddDriversComponent } from './Components/add-drivers/add-drivers.component';
import { AddVehiclesComponent } from './Components/add-vehicles/add-vehicles.component';

const routes: Routes = [
  {
    path: 'sign-in',
    component: LoginComponent,
  },
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'add-client',
    component: AddClientComponent,
  },
   {
    path: 'add-driver',
    component: AddDriversComponent,
  },
   {
    path: 'add-bus',
    component: AddVehiclesComponent,
  },
  {
    path: 'route/:routeId',
    component: AddRouteComponent,
  },
  {
    path: 'maps',
    component: MapsComponent,
  },
  //   {
  //   path: '',
  //   component: MainComponent,
  //   children: [
  //     {
  //       path: '',
  //       pathMatch: 'full',
  //       redirectTo: 'home',
  //     },
  //     {
  //       path: 'home',
  //       // component: HomeComponent,
  //       loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  //       // canActivate: [AuthGuard],
  //     },

  //   ],
  // },
  /////////////////////
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // },
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full'
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
