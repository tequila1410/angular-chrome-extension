import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import { Subject} from "rxjs";
import {ProxyModel} from "../../../../auth/models/proxy.model";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../core/store/app.reducer";
import {bestServerSelect, connecting, setRecentlyUsed, setSelectedServer} from "../../../../core/store/vpn/vpn.actions";
import {ServerApi} from "../../../../core/api/server.api";
import {getServerList, isBestServerSelected} from "../../../../core/store/vpn/vpn.selector";
import {take, takeUntil, tap} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import { animate, state, style, transition, trigger } from '@angular/animations';

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

  proxyData!: ProxyModel[];

  proxyDataFilter!: ProxyModel[];

  proxyDataUsed!: ProxyModel[];

  formControl: FormControl = new FormControl([]);

  bestPingCheckbox: FormControl = new FormControl();

  availableFeature: boolean = false;

  destroy$: Subject<void> = new Subject<void>();

  constructor(private router: Router,
              private serverService: ServerApi,
              private store: Store<AppState>) {
    const proxyDataUsed = localStorage.getItem('recentlyUsed');
    if (proxyDataUsed) {
      this.proxyDataUsed = JSON.parse(proxyDataUsed);
    }
  }

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

    this.formControl.valueChanges.subscribe(res => {
      this.proxyDataFilter = this.proxyData.filter(proxy => proxy.locationName.toLowerCase().includes(res));
    });

    this.bestPingCheckbox.valueChanges.subscribe((bestServerSelected: boolean) => {
      if (bestServerSelected !== undefined) {
        this.store.dispatch(bestServerSelect({bestServerSelected}));
        const selectedServer = bestServerSelected ?
          this.proxyData.reduce((a, b) => (a.ping < b.ping ? a : b))
          :
          this.proxyData[0];
        this.store.dispatch(setSelectedServer({selectedServer}));
        this.goToDashboard();
      }
    });
  }

  selectLocation(proxy: ProxyModel) {
    this.store.dispatch(connecting(proxy));
    this.store.dispatch(setRecentlyUsed({recentlyUsedProxy: proxy}));

    this.router.navigate(['dashboard']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

}
