import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { MarketplaceComponent } from './marketplace.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";


@NgModule({
  declarations: [
    MarketplaceComponent
  ],
    imports: [
        CommonModule,
        MarketplaceRoutingModule,
        FontAwesomeModule
    ]
})
export class MarketplaceModule { }
