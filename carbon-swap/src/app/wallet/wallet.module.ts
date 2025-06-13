import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WalletRoutingModule } from './wallet-routing.module';
import { WalletComponent } from './wallet.component';
import {FormsModule} from "@angular/forms";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";


@NgModule({
  declarations: [
    WalletComponent
  ],
    imports: [
        CommonModule,
        WalletRoutingModule,
        FormsModule,
        FontAwesomeModule
    ]
})
export class WalletModule { }
