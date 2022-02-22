import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  modeForm: FormGroup;

  inputVisible: boolean = false;

  websiteList: any[] = [];

  regularWebsiteList: any[] = [];

  selectiveWebsiteList: any[] = [];

  destroy$: Subject<void> = new Subject<void>();

  constructor(private router: Router, private fb: FormBuilder) {
    // this.modeForm = new FormGroup({
    //   mode: new FormControl(),
    // });
    this.modeForm = this.fb.group({
      mode: ['regularMode'],
    });
  }

  ngOnInit(): void {
    if (this.modeForm.value.mode === 'regularMode') {
      this.websiteList = this.regularWebsiteList;
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.websiteList = this.selectiveWebsiteList;
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  modeChange(event: any) {
    this.modeForm = this.fb.group({
      mode: [`${event.target.value}`],
    });

    if (event.target.value === 'regularMode') {
      this.websiteList = this.regularWebsiteList;
    }
    if (event.target.value === 'selectiveMode') {
      this.websiteList = this.selectiveWebsiteList;
    }
  }

  addWebsite() {
    this.inputVisible = true;
  }

  pushWebsite(event: any) {
    if (event.target.value) {
      if (this.modeForm.value.mode === 'regularMode') {
        this.regularWebsiteList.unshift(event.target.value);
      }
      if (this.modeForm.value.mode === 'selectiveMode') {
        this.selectiveWebsiteList.unshift(event.target.value);
      }
      this.inputVisible = false;
    }
  }

  deleteWebsite(itemIndex: any) {
    this.websiteList.splice(itemIndex, 1);
  }

  clearChosenList() {
    if (this.modeForm.value.mode === 'regularMode') {
      this.regularWebsiteList = [];
      this.websiteList = this.regularWebsiteList;
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.selectiveWebsiteList = [];
      this.websiteList = this.selectiveWebsiteList;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
