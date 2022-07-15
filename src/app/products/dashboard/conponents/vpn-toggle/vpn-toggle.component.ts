import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProxyModel} from 'src/app/auth/models/proxy.model';

@Component({
  selector: 'app-vpn-toggle',
  templateUrl: './vpn-toggle.component.html',
  styleUrls: ['./vpn-toggle.component.scss'],
})
export class VpnToggleComponent implements OnInit {

  /**
   * Input variable that check is proxy is connected
   * @type {boolean}
   */
  @Input() isConnected!: boolean;

  /**
   * Input variable that check is proxy is connecting
   * @type {boolean}
   */
  @Input() isConnecting!: boolean;

  /**
   * Input variable that checks the proxy for a connection error
   * @type {boolean}
   */
  @Input() isConnectionError!: boolean;

  /**
   * Input variable that checks if it`s possible to connect
   * @type {boolean}
   */
  @Input() connectAvailable!: boolean;

  /**
   * Selected server input data
   * @type {ProxyModel | undefined}
   */
  @Input() selectedServer!: ProxyModel | undefined;

  /**
   * Emmit event for toggle VPN connection
   * @type {EventEmitter<boolean>}
   */
  @Output() vpnConnectToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Constructor for VpnToggleComponent
   */
  constructor() {}

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
  }

}
