import { animate, state, style, transition, trigger } from '@angular/animations';
import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('in', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(100)
      ]),
      transition(':leave',
        animate(100, style({opacity: 0})))
    ])
  ]
})
export class HeaderComponent implements OnInit {

  @Input() currentUserName: string | undefined;

  // currentUserName!: string | undefined;
  
  /**
   * Check if menu is visible
   * @type {boolean}
   */
  isMenuVisible: boolean = false;

  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();
  @Output() goToSettings: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    if (this.currentUserName?.endsWith('@zoogvpn.com')) {
      this.currentUserName = 'Anonym';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any): void {
    const path = event.path || event.composedPath();
    this.isMenuVisible = !!path.find((item: any) => item.id === 'menu-content' || item.id === 'burger' && !this.isMenuVisible);
  }

}
