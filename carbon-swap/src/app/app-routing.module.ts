import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import {RegisterComponent} from "./register/register.component";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [
  { path: '',          component: HomeComponent, pathMatch: 'full' },
  { path: 'about',     component: AboutComponent },
  { path: 'login',     component: LoginComponent },
  { path: 'register',  component: RegisterComponent },

  {
    path: 'marketplace',
    loadChildren: () =>
      import('./marketplace/marketplace.module').then((m) => m.MarketplaceModule),
  },
  {
    path: 'wallet',
    loadChildren: () =>
      import('./wallet/wallet.module').then((m) => m.WalletModule),
  },
  {
    path: 'maps',
    loadChildren: () =>
      import('./maps/maps.module').then((m) => m.MapsModule),
  },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
