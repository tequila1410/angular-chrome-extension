import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProxyModel } from 'src/app/auth/models/proxy.model';

@Component({
  selector: 'app-vpn-toggle',
  templateUrl: './vpn-toggle.component.html',
  styleUrls: ['./vpn-toggle.component.scss'],
})
export class VpnToggleComponent implements OnInit {
  @Input() isConnected!: boolean;

  @Input() isConnecting!: boolean;

  @Input() isConnectionError!: boolean;

  @Input() selectedServer!: ProxyModel | undefined;

  @Output() vpnConnectToggle: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}
}
