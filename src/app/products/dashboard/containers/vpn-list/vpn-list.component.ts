import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import { Subject} from "rxjs";
import {ProxyModel} from "../../../../auth/models/proxy.model";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../core/store/app.reducer";
import {bestServerSelect, connecting, setRecentlyUsed} from "../../../../core/store/vpn/vpn.actions";
import {ServerApi} from "../../../../core/api/server.api";
import {getServerList, isBestServerSelected} from "../../../../core/store/vpn/vpn.selector";
import {takeUntil, tap} from "rxjs/operators";
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

  destroy$: Subject<void> = new Subject<void>();

  availableFeature: boolean = false;

  constructor(private router: Router,
              private serverService: ServerApi,
              private store: Store<AppState>) {
    const proxyDataUsed = localStorage.getItem('recentlyUsed');
    if (proxyDataUsed) {
      this.proxyDataUsed = JSON.parse(proxyDataUsed);
    }

    // const bestServerSelected = !!localStorage.getItem('isBestServerSelected');
    // this.bestPingCheckbox.setValue(bestServerSelected)
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

    this.formControl.valueChanges.subscribe(res => {
      this.proxyDataFilter = this.proxyData.filter(proxy => proxy.locationName.toLowerCase().includes(res));
    })

    this.store
      .select(isBestServerSelected)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isBestServerSelected => {
        this.bestPingCheckbox.setValue(isBestServerSelected)
      });

    this.bestPingCheckbox.valueChanges.subscribe((bestServerSelected: boolean) => {
      if (bestServerSelected !== undefined) {
        this.store.dispatch(bestServerSelect({bestServerSelected}));
      }  
    })
  }

  selectLocation(proxy: ProxyModel) {
    this.store.dispatch(connecting(proxy));
    this.store.dispatch(setRecentlyUsed(proxy))

    this.router.navigate(['dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

}
