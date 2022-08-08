import {
    ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {ProxyModel} from '../../../../auth/models/proxy.model';
import {Observable, Subject} from 'rxjs';
import {MockDataApi} from '../../../../core/api/mock-data.api';
import {map, takeUntil, tap} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../core/store/app.reducer';
import {
  closeConnection,
  connecting,
  connectingError,
  connectingSuccess, setRegularExclusions, setSelectiveExclusions, setServers,
} from '../../../../core/store/vpn/vpn.actions';
import {
  getSelectedVpnServer,
  isConnecting,
  isVPNConnected,
  isConnectionError,
  isConnectionRetry,
} from '../../../../core/store/vpn/vpn.selector';
import {
  onAuthRequiredHandler,
  onProxyErrorHandler,
} from '../../../../core/utils/chrome-backgroud';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {User} from '../../../../core/models/user.model';
import {getUserData} from '../../../../core/store/user/user.selector';
import {signOut} from '../../../../core/store/user/user.actions';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {DashboardApi} from 'src/app/core/api/dashboard.api';
import {DashboardOverview} from 'src/app/core/models/dashboard-overview.model';
import {UserCred} from "../../../../core/models/user-cred.enum";
import {PassPopupService} from 'src/app/core/components/pass-popup/pass-popup.service';
import { SnackbarService } from 'src/app/core/components/snackbar/snackbar.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('in', style({opacity: 1})),
      transition(':enter', [style({opacity: 0}), animate(300)]),
    ]),
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
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

  isConnectionRetry!: boolean;

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

  overviewData$!: Observable<DashboardOverview>;

  connectAvailable: boolean = true;

  captchaElement!: HTMLElement;

  /**
   * Subject to destroy all subscriptions on component destroy
   * @type {Subject<void>}
   */
  destroy$: Subject<void> = new Subject<void>();

  constructor(
    private serverService: MockDataApi,
    private dashboardApi: DashboardApi,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private passPopupService: PassPopupService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef
  ) {
    this.store.dispatch(setRegularExclusions());

    this.form = new FormGroup({
      proxy: new FormControl(),
    });

    this.store
      .select(getUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.currentUser = user));

    this.overviewData$ = this.dashboardApi.getOverViewData()
      .pipe(
        map(res => {
          if (res.data.accountDetails.monthlyUsedBandwidth >= res.data.accountDetails.monthlyBandwidthAllowance
              && res.data.accountDetails.monthlyBandwidthAllowance > 0) {
            this.connectAvailable = false;
          }
          this.captchaElement = document.getElementsByClassName('grecaptcha-badge')[0] as HTMLElement;
          if (this.captchaElement) {
            this.captchaElement.style.visibility = 'hidden';
          }
          return res.data;
        })
      )
  }

  ngOnInit(): void {
    onProxyErrorHandler().then((details) => {
      this.store.dispatch(connectingError({message: 'connection error'}));
      console.error('onProxyErrorHandler: ', details.error);
    });

    this.store
      .select(isVPNConnected)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVPNConnected) => {
        this.isConnected = isVPNConnected;
        console.log('is vpn connected: ', this.isConnected);
      });

    this.store
      .select(isConnecting)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isConnecting) => {
        this.isConnecting = isConnecting;
      });

    this.store
      .select(isConnectionRetry)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isConnectionRetry) => {
        console.log('isConnectionRetry', isConnectionRetry);
        this.isConnectionRetry = isConnectionRetry;
      });

    this.store
      .select(isConnectionError)
      .pipe(takeUntil(this.destroy$))
      .subscribe((connectionError) => {
        if (connectionError) {
          this.isConnectionError = true;
        } else {
          this.isConnectionError = false;
        }
      });

    this.store
      .select(getSelectedVpnServer)
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedServer) => {
        this.selectedServer = selectedServer;
        this.cdr.detectChanges();
      });

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: Params) => {
      if (params['connect'] === 'connect') {
        this.vpnConnectToggle(true)
      }
    });
  }

  /**
   * Toggle to connect and disconnect proxy
   * @return {void}
   */
  vpnConnectToggle(force?: boolean): void {
    if (!this.connectAvailable) {
      this.snackbarService.show({message: 'Your bandwidth allowance is reached the limit. Please extend your sibscription.'});
    }
    else {
      if (this.isConnected && !force) {
        this.store.dispatch(closeConnection());
      } else if (this.selectedServer) {
        const login = localStorage.getItem(UserCred.userLogin);
        const password = localStorage.getItem(UserCred.userPassword);

        if (login && password) {
          onAuthRequiredHandler(login, password);
          this.store.dispatch(connecting(this.selectedServer));
        } else {
          this.passPopupService.show(`Enter the pass for ${this.currentUser?.email}`, login, UserCred.userPassword, this.selectedServer)
        }
      }
    }

    if (this.isConnecting && this.isConnectionError) {
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
    this.captchaElement.style.visibility = 'visible';
  }

  /**
   * Call on component destroy
   * @return {void}
   */
  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
