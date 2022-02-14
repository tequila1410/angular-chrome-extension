import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SnackbarService } from './snackbar.service';

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

export class SnackbarComponent implements OnInit {

  show = false;

  message: string = '';
  
  type: string = '';

  snackbarSubscription!: Subscription;

  constructor(private snackbarService: SnackbarService) {}

  ngOnInit(): void {
    this.snackbarSubscription = this.snackbarService.snackbarState
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
        }, 5000)

      })
  }

}