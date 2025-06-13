import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent }      from './home/home.component';
import { AboutComponent }     from './about/about.component';
import { LoginComponent }     from './login/login.component';
import { RegisterComponent }  from './register/register.component';
import { authActivateGuard, authMatchGuard } from '../core/auth.guard';
import {ProfileComponent} from "./profile/profile.component";

const routes: Routes = [
  { path:'', component:HomeComponent, pathMatch:'full' },
  { path:'about', component:AboutComponent },
  { path:'login', component:LoginComponent },
  { path:'register', component:RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authActivateGuard] },
  {
    path: 'marketplace',
    loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule),
    canActivate: [authActivateGuard],
    canMatch:    [authMatchGuard],
  },
  {
    path: 'wallet',
    loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletModule),
    canActivate: [authActivateGuard],
    canMatch:    [authMatchGuard],
  },
  {
    path: 'maps',
    loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule),
    canActivate: [authActivateGuard],
    canMatch:    [authMatchGuard],
  },

  { path:'**', redirectTo:'' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
