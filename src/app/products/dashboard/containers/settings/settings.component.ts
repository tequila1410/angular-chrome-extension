import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

  regularInput: boolean = false;

  selectiveInput: boolean = false;

  regularExclusions!: ExclusionLink[];

  selectiveExclusions!: ExclusionLink[];

  needAddSelective: boolean = false;

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
    this.store
      .select(getRegularExclusions)
      .pipe(take(1))
      .subscribe(regularExclusions => {
        this.regularExclusions = regularExclusions;
      })

    this.store
      .select(getSelectiveExclusions)
      .pipe(take(1))
      .subscribe(selectiveExclusions => {
        this.selectiveExclusions = selectiveExclusions;
        this.checkSelecExclList();
      })

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

    if (event.target.value === 'selectiveMode' && this.selectiveExclusions.length === 0) {
      this.store.dispatch(setExclusionsMode({exclusionsMode: event.target.value, selectiveLength: this.selectiveExclusions.length}));
      this.needAddSelective = true;
    }
    else {
      this.store.dispatch(setExclusionsMode({exclusionsMode: event.target.value}));
      this.needAddSelective = false;
    }
  }

  inputVisibility(mode: string): void {
    if (mode === 'regular') {
      this.regularInput = !this.regularInput;
    }
    if (mode === 'selective') {
      this.selectiveInput = !this.selectiveInput;
    }
    
    this.webSiteForm.reset();
  }

  addWebsite(event: any, mode: string): void {
    if (this.webSiteForm.valid) {
      let linkObject: ExclusionLink = {
        link: event.target.value,
        created: new Date(),
        enabled: true
      };

      if (mode === 'regular') {
        this.store.dispatch(addRegularExclusion({regularExclusion: linkObject}));
        this.regularInput = false;
        this.regularExclusions.push(linkObject)
      }
      if (mode === 'selective') {
        this.store.dispatch(addSelectiveExclusion({selectiveExclusion: linkObject}));
        this.selectiveInput = false;
        this.selectiveExclusions.push(linkObject)
      }

      this.webSiteForm.reset();
    }
  }

  deleteWebsite(linkName: string, itemIndex: number, mode: string): void {
    if (mode === 'regular') {
      this.store.dispatch(deleteRegularExclusion({linkName}));
      this.regularExclusions.splice(itemIndex, 1);
    }
    if (mode === 'selective') {
      this.store.dispatch(deleteSelectiveExclusion({linkName}));
      this.selectiveExclusions.splice(itemIndex, 1);
      this.checkSelecExclList();
    }
  }

  clearChosenList(mode: string): void {
    if (mode === 'regular') {
      this.store.dispatch(clearChosenExclusions({chosenMode: 'regularMode'}));
      this.regularExclusions = [];
    }
    if (mode === 'selective') {
      this.store.dispatch(clearChosenExclusions({chosenMode: 'selectiveMode'}));
      this.selectiveExclusions = [];
      this.checkSelecExclList();
    }
  }

  enableChange(event: any, exclusion: ExclusionLink, mode: string): void {
    let newLinkObject: ExclusionLink = {
      link: exclusion.link,
      created: exclusion.created,
      enabled: event.target.checked
    }
    
    if (mode === 'regular') {
      this.store.dispatch(changeRegularExclusion({regularExclusion: newLinkObject}));
    }
    if (mode === 'selective') {
      this.store.dispatch(changeSelectiveExclusion({selectiveExclusion: newLinkObject}));
    }

    exclusion.enabled = event.target.checked;
  }

  checkSelecExclList(): void {
    if (this.selectiveExclusions.length === 0) {
      this.modeForm.controls['mode'].setValue('regularMode');
      this.store.dispatch(setExclusionsMode({exclusionsMode: 'regularMode'}));
    }   
  }

  trackByWebsiteLink(index: number, website: ExclusionLink) {
    return website.link;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
