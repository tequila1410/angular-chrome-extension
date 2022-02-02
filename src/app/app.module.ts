import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {AuthModule} from "./auth/auth.module";
import {CommonModule} from "@angular/common";
import {AuthApi} from "./auth/api/auth.api";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {reducers} from "./core/store/app.reducer";
import {UserEffects} from "./core/store/user/user.effect";
import {ReactiveFormsModule} from "@angular/forms";
import {VpnEffect} from "./core/store/vpn/vpn.effect";
import {RequestInterceptorService} from "./core/services/app.interceptor";
import {DashboardModule} from "./products/dashboard/dashboard.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AuthModule,
    DashboardModule,
    StoreModule.forRoot(reducers),
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
    EffectsModule.forRoot([UserEffects, VpnEffect]),
    BrowserAnimationsModule,
  ],
  providers: [
    AuthApi,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
