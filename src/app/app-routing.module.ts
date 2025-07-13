import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AddParentComponent } from './Components/add-parent/add-parent.component';
import { AddRouteComponent } from './Components/add-route/add-route.component';
import { MapsComponent } from './Components/actions-services/maps/maps.component';
import { AddDriversComponent } from './Components/add-drivers/add-drivers.component';
import { AddVehiclesComponent } from './Components/add-vehicles/add-vehicles.component';
import { EditProfileComponent } from './Components/edit-profile/edit-profile.component';
import { PlannedRouteComponent } from './Components/planned-route/planned-route.component';

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
    component: AddParentComponent,
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
    path: 'add-route',
    component: AddRouteComponent,
  },
  {
    path: 'route/:routeId',
    component: AddRouteComponent,
  },
  {
    path: 'edit-profile',
    component: EditProfileComponent,
  },
  {
    path: 'planned-route/:routeId',
    component: PlannedRouteComponent,
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
