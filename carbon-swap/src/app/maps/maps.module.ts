import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapsRoutingModule } from './maps-routing.module';
import { MapsComponent } from './maps.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";


@NgModule({
  declarations: [
    MapsComponent
  ],
    imports: [
        CommonModule,
        MapsRoutingModule,
        FontAwesomeModule
    ]
})
export class MapsModule { }
