import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SnackbarService } from 'src/app/core/components/snackbar/snackbar.service';

@Component({
  selector: 'app-vpn-toggle',
  templateUrl: './vpn-toggle.component.html',
  styleUrls: ['./vpn-toggle.component.scss'],
})
export class VpnToggleComponent implements OnInit {
  @Input() isConnected!: boolean;

  @Input() isConnecting!: boolean;

  @Input() isConnectionError!: boolean;

  @Input() connectAvailable!: boolean;

  @Output() vpnConnectToggle: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}
}
