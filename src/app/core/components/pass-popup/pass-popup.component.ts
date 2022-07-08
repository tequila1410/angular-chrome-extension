import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ProxyModel} from 'src/app/auth/models/proxy.model';
import {AppState} from '../../store/app.reducer';
import {connecting} from '../../store/vpn/vpn.actions';
import {onAuthRequiredHandler} from '../../utils/chrome-backgroud';
import {PassPopupService} from './pass-popup.service';

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
   * Variable for text to display
   * @type {string}
   */
  text!: string;

  /** 
   * Variable for current user login
   *@type {string}
   */
  login!: string;

  /** 
   * Variable for user credentials
   *@type {string}
   */
  userCred!: string;

  /** 
   * Variable for selected proxy server
   *@type {ProxyModel}
   */
  selectedServer!: ProxyModel;

  /**
   * Form control for password input
   *@type {FormControl}
   */
  passControl: FormControl = new FormControl('');

  /**
   * Subject for unsubscribing
   * @type {Subject<void>}
   */
  destroy$: Subject<void>;
   
  /**
   * Constructor for PassPopupComponent
   * @param {} popupService
   * @param {} store 
   */
  constructor(private popupService: PassPopupService, private store: Store<AppState>,) {
    this.destroy$ = new Subject<void>();
    
    this.popupService.passPopupState
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.show = state.show;
        this.text = state.text;
        this.login = state.login;
        this.userCred = state.userCred;
        this.selectedServer = state.selectedServer;
      })
  }

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
  }

  /**
   * Function for aplly password entered in popup
   * @return {void}
   */
  passApply(): void {
    onAuthRequiredHandler(this.login, this.passControl.value);
    localStorage.setItem(this.userCred, this.passControl.value);
    this.store.dispatch(connecting(this.selectedServer));
    this.show = false;
  }

  /**
   * Call on component destroy
   * @return {void}
   */
  ngOnDestroy(): void {
    this.destroy$.next();
  }
}