import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ProxyModel } from 'src/app/auth/models/proxy.model';

@Component({
  selector: 'app-vpn-toggle',
  templateUrl: './vpn-toggle.component.html',
  styleUrls: ['./vpn-toggle.component.scss'],
})
export class VpnToggleComponent implements OnInit, OnChanges {
  @Input() isConnected!: boolean;

  @Input() isConnecting!: boolean;

  @Input() isConnectionRetry!: boolean;

  @Input() isConnectionError!: boolean;

  @Input() connectAvailable!: boolean;

  @Input() selectedServer!: ProxyModel | undefined;

  @Output() vpnConnectToggle: EventEmitter<any> = new EventEmitter<any>();

  connectToggleText!: string;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      changes.isConnected?.currentValue ? this.connectToggleText = 'Connected'
      :
      changes.isConnecting?.currentValue ? this.connectToggleText = 'Connecting'
      :
      changes.isConnectionRetry?.currentValue ? this.connectToggleText = 'Retrying to connect'
      :
      changes.isConnectionError?.currentValue ? this.connectToggleText = 'Connection Error'
      :
      this.connectToggleText = 'Disconnected'
    }
  }
}
