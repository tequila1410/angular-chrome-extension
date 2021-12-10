import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {AuthModule} from "./auth/auth.module";
import {CommonModule} from "@angular/common";
import { DashboardComponent } from './products/dashboard/dashboard.component';
import {AuthApi} from "./auth/api/auth.api";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AuthModule
  ],
  providers: [
    AuthApi
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
