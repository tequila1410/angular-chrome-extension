import { animate, state, style, transition, trigger } from '@angular/animations';
import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';

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

  /**
   * Current user name input data
   * @type {string | undefined}
   */
  @Input() currentUserName: string | undefined;
  
  /**
   * Check if menu is visible
   * @type {boolean}
   */
  isMenuVisible: boolean = false;

  /**
   * Emmit event to logout user
   * @type {EventEmitter<void>}
   */
  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Emmit event for open settings component
   * @type {EventEmitter<void>}
   */
  @Output() goToSettings: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Constructor for HeaderComponent
   */
  constructor() { }

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
    if (this.currentUserName?.endsWith('@zoogvpn.com')) {
      this.currentUserName = 'Anonym';
    }
  }

  /**
   * Event listener for menu visibility change
   * @param {any} event
   * @return {viod}
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any): void {
    const path = event.path || event.composedPath();
    this.isMenuVisible = !!path.find((item: HTMLElement) => item.id === 'menu-content' || item.id === 'burger' && !this.isMenuVisible);
  }

}