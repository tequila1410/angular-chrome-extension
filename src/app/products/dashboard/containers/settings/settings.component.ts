import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { exclusionsMode, getRegularExclusions, getSelectiveExclusions, isVPNConnected } from 'src/app/core/store/vpn/vpn.selector';
import { take, takeUntil } from 'rxjs/operators';
import {
  setExclusionsMode,
  addRegularExclusion, addSelectiveExclusion,
  deleteRegularExclusion, deleteSelectiveExclusion,
  clearChosenExclusions,
  changeRegularExclusion,
  changeSelectiveExclusion,
  closeConnection} from 'src/app/core/store/vpn/vpn.actions';
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

  /**
   * Check if proxy is connected
   * @type {boolean}
   */
  isConnected: boolean = false;

  webSiteForm!: FormGroup;

  destroy$: Subject<void> = new Subject<void>();

  constructor(private router: Router,
              private fb: FormBuilder,
              private store: Store<AppState>) {
    this.webSiteForm = this.fb.group({
      webSite: new FormControl('', {
        validators: [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]
      }),
    });

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
      this.store
      .select(getRegularExclusions)
      .pipe(take(1))
      .subscribe(regularExclusions => {
        this.websiteList = regularExclusions;
      })

    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.store
      .select(getSelectiveExclusions)
      .pipe(take(1))
      .subscribe(selectiveExclusions => {
        this.websiteList = selectiveExclusions;
      })
    }

    this.store
      .select(isVPNConnected)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVPNConnected) => {
        this.isConnected = isVPNConnected;
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  modeChange(event: any): void {
    if (this.isConnected) {
      this.store.dispatch(closeConnection());
    }

    this.store.dispatch(setExclusionsMode({exclusionsMode: event.target.value}));

    if (event.target.value === 'regularMode') {
      this.store
      .select(getRegularExclusions)
      .pipe(take(1))
      .subscribe(regularExclusions => {
        this.websiteList = regularExclusions;
      })

    }
    if (event.target.value === 'selectiveMode') {
      this.store
      .select(getSelectiveExclusions)
      .pipe(take(1))
      .subscribe(selectiveExclusions => {
        this.websiteList = selectiveExclusions;
      })
    }
  }

  inputVisibility(): void {
    this.inputVisible = !this.inputVisible;
    this.webSiteForm.reset();
  }

  addWebsite(event: any): void {
    if (this.webSiteForm.valid) {
      let linkObject: ExclusionLink = {
        link: event.target.value,
        created: new Date(),
        enabled: true
      };

      if (this.modeForm.value.mode === 'regularMode') {
        this.store.dispatch(addRegularExclusion({regularExclusion: linkObject}));
      }
      if (this.modeForm.value.mode === 'selectiveMode') {
        this.store.dispatch(addSelectiveExclusion({selectiveExclusion: linkObject}));
      }
      this.websiteList.push(linkObject);
      this.inputVisible = false;
      this.webSiteForm.reset();
    }
  }

  deleteWebsite(linkName: string, itemIndex: number): void {
    if (this.modeForm.value.mode === 'regularMode') {
      this.store.dispatch(deleteRegularExclusion({linkName}));
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.store.dispatch(deleteSelectiveExclusion({linkName}));
    }
    this.websiteList.splice(itemIndex, 1)
  }

  clearChosenList(): void {
    if (this.modeForm.value.mode === 'regularMode') {
      this.store.dispatch(clearChosenExclusions({chosenMode: 'regularMode'}));
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.store.dispatch(clearChosenExclusions({chosenMode: 'selectiveMode'}));
    }
    this.websiteList = [];
  }

  enableChange(event: any, exclusion: ExclusionLink): void {
    let newLinkObject: ExclusionLink = {
      link: exclusion.link,
      created: exclusion.created,
      enabled: event.target.checked
    }
    if (this.modeForm.value.mode === 'regularMode') {
      this.store.dispatch(changeRegularExclusion({regularExclusion: newLinkObject}));
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.store.dispatch(changeSelectiveExclusion({selectiveExclusion: newLinkObject}));
    }
    exclusion.enabled = event.target.checked;
  }

  trackByWebsiteLink(index: number, website: ExclusionLink) {
    return website.link;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
