import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProxyModel} from "../../../../auth/models/proxy.model";

@Component({
  selector: 'app-server-selector',
  templateUrl: './server-selector.component.html',
  styleUrls: ['./server-selector.component.scss']
})
export class ServerSelectorComponent implements OnInit {

  /**
   * Selected server input data
   * @type {ProxyModel | undefined}
   */
  @Input() selectedServer!: ProxyModel | undefined;

  /**
   * Emmit event for open VPN list page
   * @type {EventEmitter<void>}
   */
  @Output() openVpnList: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Constructor for ServerSelectorComponent
   */
  constructor() { }

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
  }

}
