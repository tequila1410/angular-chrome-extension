import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {ProxyModel} from "../../../../auth/models/proxy.model";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../core/store/app.reducer";
import {connecting} from "../../../../core/store/vpn/vpn.actions";
import {ServerApi} from "../../../../core/api/server.api";
import {getServerList} from "../../../../core/store/vpn/vpn.selector";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-vpn-list',
  templateUrl: './vpn-list.component.html',
  styleUrls: ['./vpn-list.component.scss']
})
export class VpnListComponent implements OnInit {

  proxyData$!: Observable<ProxyModel[]>;

  constructor(private router: Router,
              private serverService: ServerApi,
              private store: Store<AppState>) { }

  ngOnInit(): void {
    this.proxyData$ = this.store.select(getServerList).pipe(tap(data => console.log(data)));
  }

  selectLocation(proxy: ProxyModel) {
    console.log('selectLocation: ', proxy)
    this.store.dispatch(connecting(proxy));
    this.router.navigate(['dashboard']);
  }

}
