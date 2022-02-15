import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import { Subject} from "rxjs";
import {ProxyModel} from "../../../../auth/models/proxy.model";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../core/store/app.reducer";
import {connecting} from "../../../../core/store/vpn/vpn.actions";
import {ServerApi} from "../../../../core/api/server.api";
import {getServerList} from "../../../../core/store/vpn/vpn.selector";
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

  formControl: FormControl = new FormControl([]);

  destroy$: Subject<void> = new Subject<void>();

  constructor(private router: Router,
              private serverService: ServerApi,
              private store: Store<AppState>) { }

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
  }

  selectLocation(proxy: ProxyModel) {
    this.store.dispatch(connecting(proxy));
    this.router.navigate(['dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

}
