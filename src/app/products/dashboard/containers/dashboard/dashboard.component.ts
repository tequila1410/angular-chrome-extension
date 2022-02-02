import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ProxyModel} from "../../../../auth/models/proxy.model";
import {ProxyService} from "../../../../core/services/proxy.service";
import {Observable, Subject} from "rxjs";
import {MockDataApi} from "../../../../core/api/mock-data.api";
import {map, takeUntil, tap} from "rxjs/operators";
import {FormControl, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../core/store/app.reducer";
import {closeConnection, connecting, connectingSuccess} from "../../../../core/store/vpn/vpn.actions";
import {getSelectedVpnServer, isVPNConnected} from "../../../../core/store/vpn/vpn.selector";
import {onAuthRequiredHandler, onProxyErrorHandler} from "../../../../core/utils/chrome-backgroud";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  form: FormGroup;

  isConnected: boolean = false;

  selectedServer: ProxyModel | undefined;

  /**
   * Subject to destroy all subscriptions on component destroy
   * @type {Subject<void>}
   */
  destroy$: Subject<void> = new Subject<void>();

  constructor(private proxyService: ProxyService,
              private serverService: MockDataApi,
              private cdr: ChangeDetectorRef,
              private router: Router,
              private store: Store<AppState>) {

    this.form = new FormGroup({
      proxy: new FormControl()
    });

  }

  ngOnInit(): void {

    onAuthRequiredHandler('vlad.zubko@rankactive.com', 'pass2zoog');
    onProxyErrorHandler();

    this.store.select(isVPNConnected)
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe(isVPNConnected => {
      this.isConnected = isVPNConnected;
      this.cdr.detectChanges();
      console.log('isVPNConnected: ', isVPNConnected);
    });

    this.store.select(getSelectedVpnServer)
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe(selectedServer => {
      this.selectedServer = selectedServer;
      this.cdr.detectChanges();
      console.log('selectedServer: ', selectedServer);
    })

  }

  vpnConnectToggle() {

    if (this.isConnected) {
      this.store.dispatch(closeConnection())
    } else if (this.selectedServer) {
      this.store.dispatch(connecting(this.selectedServer));

    }
  }

  openVpnList() {
    this.router.navigate(['vpn-list'])
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

}
