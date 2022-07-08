import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SnackbarService} from './snackbar.service';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
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

export class SnackbarComponent implements OnInit, OnDestroy {

  /**
   * Variable for snackbar visibility
   * @type {boolean}
   */
  show: boolean = false;

  /**
   * Message to display
   * @type {string}
   */
  message: string = '';
  
  /**
   * Variable for type of response
   * @type {string}
   */
  type: string = '';

  /**
   * Subject for unsubscribing
   * @type {Subject<void>}
   */
  destroy$: Subject<void>;

  /**
   * Constructor for SnackbarComponent
   * @param {SnackbarService} snackbarService
   */
  constructor(private snackbarService: SnackbarService) {
    this.destroy$ = new Subject<void>();
  }

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
    this.snackbarService.snackbarState
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.responseContent.errors) {
          this.type = 'danger';
        
          for (let error in state.responseContent.errors) {
            this.message += `${state.responseContent.errors[error]} `
          }
        }
        else {
          this.type = 'danger';

          this.message = state.responseContent.message;
        }

        this.show = state.show;
        setTimeout(() => {
          this.show = false;
          this.message = '';
        }, 6000)

      })
  }

  /**
   * Call on component destroy
   * @return {void}
   */
  ngOnDestroy(): void {
    this.destroy$.next();
  }
}