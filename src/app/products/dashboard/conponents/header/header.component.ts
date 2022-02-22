import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  /**
   * Check if menu is visible
   * @type {boolean}
   */
  isMenuVisible: boolean = false;

  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();
  @Output() goToSettings: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any): void {
    const path = event.path || event.composedPath();
    this.isMenuVisible = !!path.find((item: any) => item.id === 'menu-content' || item.id === 'burger' && !this.isMenuVisible);
  }

}
