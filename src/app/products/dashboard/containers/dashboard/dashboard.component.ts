import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ProxyModel } from '../../../../auth/models/proxy.model';
import { ProxyService } from '../../../../core/services/proxy.service';
import { Observable, Subject } from 'rxjs';
import { MockDataApi } from '../../../../core/api/mock-data.api';
import { map, takeUntil, tap } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/store/app.reducer';
import {
  closeConnection,
  connecting,
  connectingSuccess,
} from '../../../../core/store/vpn/vpn.actions';
import {
  getSelectedVpnServer,
  isConnecting,
  isVPNConnected,
  isConnectionError,
} from '../../../../core/store/vpn/vpn.selector';
import {
  onAuthRequiredHandler,
  onProxyErrorHandler,
} from '../../../../core/utils/chrome-backgroud';
import { Router } from '@angular/router';
import { User } from '../../../../core/models/user.model';
import { getUserData } from '../../../../core/store/user/user.selector';
import { signOut } from '../../../../core/store/user/user.actions';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [style({ opacity: 0 }), animate(300)]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  isConnecting: boolean = false;

  isConnectionError!: boolean;

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

  constructor(
    private proxyService: ProxyService,
    private serverService: MockDataApi,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.form = new FormGroup({
      proxy: new FormControl(),
    });

    this.store
      .select(getUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.currentUser = user));
  }

  ngOnInit(): void {
    onAuthRequiredHandler('7a9e9ebb1a0f', 'eb8c940eb5');
    onProxyErrorHandler().then((details) => {
      this.store.dispatch(closeConnection());
      console.error(details.error);
    });

    this.store
      .select(isVPNConnected)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVPNConnected) => {
        this.isConnected = isVPNConnected;
        this.cdr.detectChanges();
        console.log('isVPNConnected: ', isVPNConnected);
      });

    this.store
      .select(isConnecting)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isConnecting) => {
        console.log('isConnecting: ', isConnecting);
        this.isConnecting = isConnecting;
        this.cdr.detectChanges();
      });

    this.store
      .select(isConnectionError)
      .pipe(takeUntil(this.destroy$))
      .subscribe((connectionError) => {
        if (connectionError) {
          this.isConnectionError = true;
          this.cdr.detectChanges();
        } else {
          this.isConnectionError = false;
          this.cdr.detectChanges();
        }
      });

    this.store
      .select(getSelectedVpnServer)
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedServer) => {
        this.selectedServer = selectedServer;
        this.cdr.detectChanges();
        console.log('selectedServer: ', selectedServer);
      });
  }

  /**
   * Toggle to connect and disconnect proxy
   * @return {void}
   */
  vpnConnectToggle(): void {
    if (this.isConnected) {
      this.store.dispatch(closeConnection());
    } else if (this.selectedServer) {
      this.store.dispatch(connecting(this.selectedServer));
    }

    if  (this.isConnecting && this.isConnectionError) {
      setTimeout(() => {
        this.store.dispatch(closeConnection());
      }, 5000)
    }
  }

  /**
   * Redirect to page with proxy list
   * @return {void}
   */
  openVpnList() {
    this.router.navigate(['/dashboard/vpn-list']);
  }

  goToSettings() {
    this.router.navigate(['/dashboard/settings'])
  }

  /**
   * Sign out user
   * @return {void}
   */
  signOut(): void {
    this.store.dispatch(signOut());
  }

  /**
   * Call on component destroy
   * @return {void}
   */
  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
