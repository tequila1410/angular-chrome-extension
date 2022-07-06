import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {ProxyModel} from "../../../../auth/models/proxy.model";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../core/store/app.reducer";
import {bestServerSelect, setRecentlyUsed, setSelectedServer} from "../../../../core/store/vpn/vpn.actions";
import {getServerList, isBestServerSelected} from "../../../../core/store/vpn/vpn.selector";
import {take, takeUntil, tap} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-vpn-list',
  templateUrl: './vpn-list.component.html',
  styleUrls: ['./vpn-list.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('in', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(300)
      ]),
    ])
  ]
})
export class VpnListComponent implements OnInit, OnDestroy {
  
  /**
   * List of all proxies
   * @type {ProxyModel[]}
   */
  proxyData!: ProxyModel[];
  
  /**
   * List of filtered proxies
   * @type {ProxyModel[]}
   */
  proxyDataFilter!: ProxyModel[];
  
  /**
   * List of recently used proxies
   * @type {ProxyModel[]}
   */
  proxyDataUsed!: ProxyModel[];
  
  /**
   * Form control for search location input
   * @type {FormControl}
   */
  searchLocation: FormControl = new FormControl([]);
  
  /**
   * Form control for best ping finding checkbox
   * @type {FormControl}
   */
  bestPingCheckbox: FormControl = new FormControl();
  
  /**
   * Varianle for recognize available feature of proxy
   * @type {boolean}
   */
  availableFeature: boolean = false;
  
  /**
   * Subject to destroy all subscriptions on component destroy
   * @type {Subject<void>}
   */
  destroy$: Subject<void> = new Subject<void>();

  /**
   * Constructor for VpnListComponent
   * @param {Router} router 
   * @param {Store<AppState>} store 
   */
  constructor(private router: Router, private store: Store<AppState>) {
    const proxyDataUsed = localStorage.getItem('recentlyUsed');
    if (proxyDataUsed) {
      this.proxyDataUsed = JSON.parse(proxyDataUsed);
    }
  }

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
    this.store.select(getServerList)
      .pipe(
        takeUntil(this.destroy$),
        tap(data => {
          this.proxyData = data;
          this.proxyDataFilter = data;
        })
      ).subscribe();

    this.store
      .select(isBestServerSelected)
      .pipe(take(1))
      .subscribe(isBestServerSelected => {
        this.bestPingCheckbox.setValue(isBestServerSelected);
      });

    this.searchLocation.valueChanges.subscribe(res => {
      this.proxyDataFilter = this.proxyData.filter(proxy => proxy.locationName.toLowerCase().includes(res));
    });

    this.bestPingCheckbox.valueChanges.subscribe((bestServerSelected: boolean) => {
      this.store.dispatch(bestServerSelect({bestServerSelected}));

      const selectedServer = bestServerSelected ?
        this.proxyData
          .filter(proxy => proxy.host !== 'locked' && proxy.ping > 0)
          .reduce((a, b) => (a.ping < b.ping ? a : b))
        :
        this.proxyData.filter(proxy => proxy.host !== 'locked' && proxy.ping > 0)[0];
        
      this.store.dispatch(setSelectedServer({selectedServer}));
    });
  }

  /**
   * Set selected proxy for extension & update recently used proxy list
   * @param {ProxyModel} proxy
   * @return {void}
   */
  selectLocation(proxy: ProxyModel): void {
    if (proxy.host !== 'locked') {
      this.store.dispatch(setRecentlyUsed({recentlyUsedProxy: proxy}));
      this.store.dispatch(setSelectedServer({selectedServer: proxy}));

      this.router.navigate(['dashboard', 'connect']);
    }
  }

  /**
   * Redirect to dashboard page
   * @return {void}
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Used to track only needed proxy
   * @param {number} index 
   * @param {ProxyModel} proxy 
   * @return {string}
   */
  trackByProxyId(index: number, proxy: ProxyModel): string {
    return proxy.id;
  }

  /**
   * Call on component destroy
   * @return {void}
   */
  ngOnDestroy(): void {
    this.destroy$.next();
  }

}
