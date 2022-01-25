import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ProxyModel} from "../../auth/models/proxy.model";
import {ProxyService} from "../../core/services/proxy.service";
import {ServerApi} from "../../core/api/server.api";
import {Observable, Subject} from "rxjs";
import {MockDataApi} from "../../core/api/mock-data.api";
import {map, takeUntil, tap} from "rxjs/operators";
import {FormControl, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {AppState} from "../../core/store/app.reducer";
import {closeConnection, connecting, connectingSuccess} from "../../core/store/vpn/vpn.actions";
import {isVPNConnected} from "../../core/store/vpn/vpn.selector";
import {onAuthRequiredHandler, onProxyErrorHandler} from "../../core/utils/chrome-backgroud";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  testProxy: ProxyModel = {
    id: 1,
    locationName: 'Moldova',
    scheme: "http",
    host: "176.116.234.35",
    port: 12323
  };

  proxyData!: Observable<ProxyModel[]>;

  form: FormGroup;

  isConnected: boolean = false;

  /**
   * Subject to destroy all subscriptions on component destroy
   * @type {Subject<void>}
   */
  destroy$: Subject<void> = new Subject<void>();

  constructor(private proxyService: ProxyService,
              private serverService: MockDataApi,
              private cdr: ChangeDetectorRef,
              private store: Store<AppState>) {

    this.form = new FormGroup({
      proxy: new FormControl()
    });

    this.store.select(isVPNConnected)
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe(isVPNConnected => {
      this.isConnected = isVPNConnected;
    });
  }

  ngOnInit(): void {

    onAuthRequiredHandler('7a0dbc61784a', '04b6fa638a');
    onProxyErrorHandler();

    this.proxyData = this.serverService.getServersData()
      .pipe(
        map(res => res.data)
      );

    chrome.proxy.settings.get(
      {'incognito': false},
      (config) => {
        const proxy: ProxyModel = config?.value?.rules?.singleProxy;
        if (proxy)
          this.store.dispatch(connectingSuccess(proxy));
      }
    );
  }

  ngAfterViewInit() {

  }

  vpnConnectToggle() {

    if (this.isConnected) {
      this.store.dispatch(closeConnection())
    } else {
      this.store.dispatch(connecting(this.testProxy));

    }
  }

  checkProxy() {
    this.proxyService.checkProxy();
  }

  clearProxy() {
    this.proxyService.clearProxy();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

}
