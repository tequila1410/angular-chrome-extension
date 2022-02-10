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
import {User} from "../../../../core/models/user.model";
import {getUserData} from "../../../../core/store/user/user.selector";
import {signOut} from "../../../../core/store/user/user.actions";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  /**
   * Form group for proxy selector
   * @type {FormGroup}
   */
  form: FormGroup;

  /**
   * Check if proxy is connected
   * @type {boolean}
   */
  isConnected: boolean = false;

  /**
   * Selected proxy server
   * @type {ProxyModel}
   */
  selectedServer: ProxyModel | undefined;

  /**
   * Current user data
   * @type {User}
   */
  currentUser!: User | undefined;

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

    this.store.select(getUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.currentUser = user)

  }

  ngOnInit(): void {

    onAuthRequiredHandler('7a908c6f490e', 'ffff3d116e');
    onProxyErrorHandler().then(details => {
      this.store.dispatch(closeConnection());
      console.error(details.error);
    });

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

  /**
   * Toggle to connect and disconnect proxy
   * @return {void}
   */
  vpnConnectToggle(): void {

    if (this.isConnected) {
      this.store.dispatch(closeConnection())
    } else if (this.selectedServer) {
      this.store.dispatch(connecting(this.selectedServer));

    }
  }

  /**
   * Redirect to page with proxy list
   * @return {void}
   */
  openVpnList() {
    this.router.navigate(['/dashboard/vpn-list'])
  }

  /**
   * Sign out user
   * @return {void}
   */
  signOut(): void {
    this.store.dispatch(signOut())
  }

  /**
   * Call on component destroy
   * @return {void}
   */
  ngOnDestroy(): void {
    this.destroy$.next();
  }

}
