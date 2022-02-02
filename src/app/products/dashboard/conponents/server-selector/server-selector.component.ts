import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProxyModel} from "../../../../auth/models/proxy.model";

@Component({
  selector: 'app-server-selector',
  templateUrl: './server-selector.component.html',
  styleUrls: ['./server-selector.component.scss']
})
export class ServerSelectorComponent implements OnInit {

  @Input() selectedServer!: ProxyModel | undefined;

  @Output() openVpnList: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

}
