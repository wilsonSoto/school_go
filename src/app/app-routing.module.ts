import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
    {
    path: 'sign-in',
    component: LoginComponent,
  },
  {
    path: '',   
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
     path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
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
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
