import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SnackbarService } from './snackbar.service';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})

export class SnackbarComponent implements OnInit {

  show = false;

  message: string = 'This is snackbar';
  
  type: string = 'success';

  snackbarSubscription!: Subscription;

  constructor(private snackbarService: SnackbarService) {}

  ngOnInit(): void {
    this.snackbarSubscription = this.snackbarService.snackbarState
      .subscribe(state => {
        if (state.type) {
          this.type = state.type;
        }
        else {
          this.type = 'success';
        }
        this.message = state.message;
        this.show = state.show;
        setTimeout(() => {
          this.show = false;
        }, 3000)
      })
  }

}