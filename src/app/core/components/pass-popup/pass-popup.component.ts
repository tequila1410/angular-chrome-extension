import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProxyModel } from 'src/app/auth/models/proxy.model';
import { AppState } from '../../store/app.reducer';
import { connecting } from '../../store/vpn/vpn.actions';
import { onAuthRequiredHandler } from '../../utils/chrome-backgroud';
import { PassPopupService } from './pass-popup.service';

@Component({
  selector: 'app-pass-popup',
  templateUrl: './pass-popup.component.html',
  styleUrls: ['./pass-popup.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('in', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(300)
      ]),
      transition(':leave',
        animate(300, style({opacity: 0})))
    ])
  ]
})

export class PassPopupComponent implements OnInit, OnDestroy {

  /**
   * Variable for snackbar visibility
   * @type {boolean}
   */
  show: boolean = false;
  
  /**
   *
   * @type {string}
   */
  text!: string;

  log!: string;

  userCred!: string;

  selectedServer!: ProxyModel;

  formControl: FormControl = new FormControl('');

  /**
   * Subject for unsubscribing
   * @type {Subject<void>}
   */
  destroy$: Subject<void>;

  constructor(private popupService: PassPopupService,
              private store: Store<AppState>,) {
    this.destroy$ = new Subject<void>();
    
    this.popupService.passPopupState
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.show = state.show;
        this.text = state.text;
        this.log = state.log;
        this.userCred = state.userCred;
        this.selectedServer = state.selectedServer;
      })
  }

  ngOnInit(): void {

  }

  passApply(): void {
    onAuthRequiredHandler(this.log, this.formControl.value);
    localStorage.setItem(this.userCred, this.formControl.value);
    this.store.dispatch(connecting(this.selectedServer));
    this.show = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}