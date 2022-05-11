import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ExclusionDbService } from 'src/app/core/utils/indexedDB/exclusion-db.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/core/store/app.reducer';
import { exclusionsMode } from 'src/app/core/store/vpn/vpn.selector';
import { take, takeUntil } from 'rxjs/operators';
import { setExclusionsMode } from 'src/app/core/store/vpn/vpn.actions';
import { ExclusionLink } from 'src/app/core/models/exclusion-link.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('in', style({opacity: 1})),
      transition(':enter', [style({opacity: 0}), animate(300)]),
    ]),
  ],
})
export class SettingsComponent implements OnInit, OnDestroy {
  modeForm!: FormGroup;

  inputVisible: boolean = false;

  websiteList!: ExclusionLink[];

  destroy$: Subject<void> = new Subject<void>();

  constructor(private router: Router,
              private fb: FormBuilder,
              private exclusionDB: ExclusionDbService,
              private store: Store<AppState>) {

    this.store
      .select(exclusionsMode)
      .pipe(take(1))
      .subscribe(exclusionsMode => {
        this.modeForm = this.fb.group({
          mode: [exclusionsMode],
        });
    });
  }

  ngOnInit(): void {
    if (this.modeForm.value.mode === 'regularMode') {
      this.exclusionDB.getRegularLinks()
        .pipe(takeUntil(this.destroy$))
        .subscribe(links => {
          this.websiteList = links;
        });
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.exclusionDB.getSelectiveLinks()
        .pipe(takeUntil(this.destroy$))
        .subscribe(links => {
          this.websiteList = links;
        });
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  modeChange(event: any) {
    this.store.dispatch(setExclusionsMode({exclusionsMode: event.target.value}));

    if (event.target.value === 'regularMode') {
      this.exclusionDB.getRegularLinks()
        .pipe(takeUntil(this.destroy$))
        .subscribe(links => {
          this.websiteList = links;
        });
    }
    if (event.target.value === 'selectiveMode') {
      this.exclusionDB.getSelectiveLinks()
        .pipe(takeUntil(this.destroy$))
        .subscribe(links => {
          this.websiteList = links;
        });
    }
  }

  inputVisibility() {
    this.inputVisible = true;
  }

  addWebsite(event: any) {
    if (event.target.value) {
      let linkObject: ExclusionLink = {
        link: event.target.value,
        created: new Date()
      };

      if (this.modeForm.value.mode === 'regularMode') {
        this.exclusionDB.addLink('regularMode', linkObject).pipe(takeUntil(this.destroy$)).subscribe();
      }
      if (this.modeForm.value.mode === 'selectiveMode') {
        this.exclusionDB.addLink('selectiveMode', linkObject).pipe(takeUntil(this.destroy$)).subscribe();
      }
      this.websiteList.push(linkObject);
      this.inputVisible = false;
    }
  }

  deleteWebsite(link: string, itemIndex: number) {
    if (this.modeForm.value.mode === 'regularMode') {
      this.exclusionDB.removeLink('regularMode', link).pipe(takeUntil(this.destroy$)).subscribe();
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.exclusionDB.removeLink('selectiveMode', link).pipe(takeUntil(this.destroy$)).subscribe();
    }
    this.websiteList.splice(itemIndex, 1)
  }

  exportWebsiteList() {
    const list = JSON.stringify(this.websiteList);

    const file = new window.Blob([list], { type: 'text/plain' });

    const downloadAncher = document.createElement('a');
    downloadAncher.style.display = 'none';

    const fileURL = URL.createObjectURL(file);
    downloadAncher.href = fileURL;
    downloadAncher.download = `${this.modeForm.value.mode}Websites.txt`;
    downloadAncher.click();
  }

  clearChosenList() {
    if (this.modeForm.value.mode === 'regularMode') {
      this.exclusionDB.removeDB('regularMode');
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.exclusionDB.removeDB('selectiveMode');
    }
    this.websiteList = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
