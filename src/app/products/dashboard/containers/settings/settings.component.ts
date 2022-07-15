import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {Store} from '@ngrx/store';
import {AppState} from 'src/app/core/store/app.reducer';
import {exclusionsMode, getRegularExclusions, getSelectiveExclusions, isVPNConnected} from 'src/app/core/store/vpn/vpn.selector';
import {take, takeUntil} from 'rxjs/operators';
import {
  setExclusionsMode,
  addRegularExclusion, addSelectiveExclusion,
  deleteRegularExclusion, deleteSelectiveExclusion,
  clearChosenExclusions,
  changeRegularExclusion,
  changeSelectiveExclusion,
  closeConnection} from 'src/app/core/store/vpn/vpn.actions';
import {ExclusionLink} from 'src/app/core/models/exclusion-link.model';

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

  /**
   * Change exclusions mode form
   * @type {FormGroup}
   */
  modeForm!: FormGroup;

  /**
   * Variable for hide/show input
   * @type {boolean}
   */
  inputVisible: boolean = false;

  /**
   * Excluded site form
   * @type {FormGroup}
   */
  excludedSiteForm!: FormGroup;

  /**
   * List of excluded sites
   * @type {ExclusionLink[]}
   */
  exclusionsList!: ExclusionLink[];

  /**
   * Check if proxy is connected
   * @type {boolean}
   */
  isConnected: boolean = false;

  /**
   * Subject to destroy all subscriptions on component destroy
   * @type {Subject<void>}
   */
  destroy$: Subject<void> = new Subject<void>();

  /**
   * Constructor for SettingsComponent
   * @param {Router} router 
   * @param {FormBuilder} fb 
   * @param {Store<AppState>} store 
   */
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.excludedSiteForm = this.fb.group({
      excludedSite: new FormControl('', {
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

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
    if (this.modeForm.value.mode === 'regularMode') {
      this.store
      .select(getRegularExclusions)
      .pipe(take(1))
      .subscribe(regularExclusions => {
        this.exclusionsList = regularExclusions;
      })
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.store
      .select(getSelectiveExclusions)
      .pipe(take(1))
      .subscribe(selectiveExclusions => {
        this.exclusionsList = selectiveExclusions;
      })
    }

    this.store
      .select(isVPNConnected)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVPNConnected) => {
        this.isConnected = isVPNConnected;
      });
  }

  /**
   * Redirect to dashboard page
   * @return {void}
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Detect current exclusion mode & set chosen exclusions list
   * @param {any} event
   * @return {void}
   */
  exclusionModeChange(event: any): void {
    if (this.isConnected) {
      this.store.dispatch(closeConnection());
    }

    this.store.dispatch(setExclusionsMode({exclusionsMode: event.target.value}));

    if (event.target.value === 'regularMode') {
      this.store
      .select(getRegularExclusions)
      .pipe(take(1))
      .subscribe(regularExclusions => {
        this.exclusionsList = regularExclusions;
      })
    }
    if (event.target.value === 'selectiveMode') {
      this.store
      .select(getSelectiveExclusions)
      .pipe(take(1))
      .subscribe(selectiveExclusions => {
        this.exclusionsList = selectiveExclusions;
      })
    }
  }

  /**
   * Changes input visibility
   * @return {void}
   */
  inputVisibility(): void {
    this.inputVisible = !this.inputVisible;
    this.excludedSiteForm.reset();
  }

  /**
   * Add excluded site to chosen exclusion list
   * @param {any} event 
   * @return {void}
   */
  addExcludedSite(event: any): void {
    if (this.excludedSiteForm.valid) {
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

      this.exclusionsList.push(linkObject);
      this.inputVisible = false;
      this.excludedSiteForm.reset();
    }
  }

  /**
   * Delete excluded site from chosen exclusion list
   * @param {string} linkName 
   * @param {itemIndex} itemIndex
   * @return {void}
   */
  deleteExcludedSite(linkName: string, itemIndex: number): void {
    if (this.modeForm.value.mode === 'regularMode') {
      this.store.dispatch(deleteRegularExclusion({linkName}));
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.store.dispatch(deleteSelectiveExclusion({linkName}));
    }

    this.exclusionsList.splice(itemIndex, 1)
  }

  /**
   * Clear chosen exclusion list
   * @return {void}
   */
  clearChosenList(): void {
    if (this.modeForm.value.mode === 'regularMode') {
      this.store.dispatch(clearChosenExclusions({chosenMode: 'regularMode'}));
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.store.dispatch(clearChosenExclusions({chosenMode: 'selectiveMode'}));
    }
    
    this.exclusionsList = [];
  }

  /**
   * Changes the state of the exclusion
   * @param {any} event 
   * @param {ExclusionLink} exclusion
   * @return {void} 
   */
  enableChange(event: any, exclusion: ExclusionLink): void {
    let newExclusionObject: ExclusionLink = {
      link: exclusion.link,
      created: exclusion.created,
      enabled: event.target.checked
    }

    if (this.modeForm.value.mode === 'regularMode') {
      this.store.dispatch(changeRegularExclusion({regularExclusion: newExclusionObject}));
    }
    if (this.modeForm.value.mode === 'selectiveMode') {
      this.store.dispatch(changeSelectiveExclusion({selectiveExclusion: newExclusionObject}));
    }

    exclusion.enabled = event.target.checked;
  }

  /**
   * Used to change only chosen exclusion
   * @param {number} index 
   * @param {ExclusionLink} website 
   * @return {string}
   */
  trackByWebsiteLink(index: number, website: ExclusionLink): string {
    return website.link;
  }

  /**
   * Call on component destroy
   * @return {void}
   */
  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
