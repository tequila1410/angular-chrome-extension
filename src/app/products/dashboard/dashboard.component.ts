import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  connectToVpn() {
    const config = {
      mode: "fixed_servers",
      rules: {
        proxyForHttps: {
          scheme: "http",
          host: "20.47.108.204",
          port: 8888
        },
        bypassList: ["foobar.com"]
      }
    };
    chrome.proxy.settings.set(
      {value: config, scope: 'regular'},
      function() {
        console.log('set')
      }
    );

  }

  checkProxy() {
    chrome.proxy.settings.get(
      {'incognito': false},
      function(config) {
        console.log(JSON.stringify(config));
      }
    );
  }

  clearProxy() {
    chrome.proxy.settings.clear({}, () => {
      console.log('clear')
    });
  }

  getSerp() {

  }

}
