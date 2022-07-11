import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {exhaustMap} from "rxjs/operators";
import {ExclusionLink} from "../../models/exclusion-link.model";

@Injectable({
  providedIn: 'root'
})
export class ExclusionDbService {
  
  /**
   * Interface of the IndexedDB API provides access to the results of requests to open or delete databases
   * @type {IDBOpenDBRequest}
   */
  private openRequest!: IDBOpenDBRequest;
  
  /**
   * Interface of the IndexedDB API provides a connection to a database
   * @type {IDBDatabase}
   */
  private db!: IDBDatabase;

  /**
   * Constructor for ExclusionDbService
   */
  constructor() {
    console.log('IndexedDBService constructor');
  }

  /**
   * Opens exclusions data base
   * @return {Observable<unknown>}
   */
  private exclusionsIndexedDBInit(): Observable<unknown> {
    return new Observable((subscriber) => {
      this.openRequest = indexedDB.open('exclusionsDB', 1);
      this.openRequest.onupgradeneeded = () => {
        this.db = this.openRequest.result;

        if (!this.db.objectStoreNames.contains('regularModeLinks')) {
          this.db.createObjectStore('regularModeLinks', {keyPath: 'link'});
        }
        if (!this.db.objectStoreNames.contains('selectiveModeLinks')) {
          this.db.createObjectStore('selectiveModeLinks', {keyPath: 'link'});
        }

        subscriber.next(this.db);
      };

      this.openRequest.onerror = () => {
        console.error("Error", this.openRequest.error);
        subscriber.error(this.openRequest.error);
      };

      this.openRequest.onsuccess = () => {
        this.db = this.openRequest.result;
        this.db.onversionchange = () => {
          this.db.close();
          console.log("The database is out of date, please reload the page.")
        };

        subscriber.next(this.db);
      };
    })
  }

  /**
   * Handler for recognize data base section
   * @param {Function} fn 
   * @return {Observable<any>}
   */
  private handler(fn: Function): Observable<any> {
    fn = fn.bind(this);
    if (!this.openRequest?.result) {
      return this.exclusionsIndexedDBInit()
        .pipe(exhaustMap(() => {
        return fn();
      }));
    }
    return fn();
  }

  /**
   * Get regural mode exclusions
   * @return {Observable<ExclusionLink[]>}
   */
  public getRegularLinks(): Observable<ExclusionLink[]> {
    return this.handler(this.getRegularLinksHandler)
  }

  /**
   * Get selective mode exclusions
   * @return {Observable<ExclusionLink[]>}
   */
  public getSelectiveLinks(): Observable<ExclusionLink[]> {
    return this.handler(this.getSelectiveLinksHandler)
  }

  /**
   * Handler for creating regular exclusions section
   * @return {Observable<ExclusionLink[]>}
   */
  private getRegularLinksHandler(): Observable<ExclusionLink[]> {
    return new Observable((subscriber) => {
      let regularTransaction = this.db.transaction('regularModeLinks', 'readonly');
      let regularLinksStore = regularTransaction.objectStore('regularModeLinks');

      let reularRequest = regularLinksStore.getAll();

      reularRequest.onsuccess = () => {
        subscriber.next(reularRequest.result);
      }

      reularRequest.onerror = () => {
        console.log('get links error', reularRequest.error)
        subscriber.error(reularRequest);
      }
    })
  }

  /**
   * Handler for creating selective exclusions section
   * @return {Observable<ExclusionLink[]>}
   */
  private getSelectiveLinksHandler(): Observable<ExclusionLink[]> {
    return new Observable((subscriber) => {
      let selectiveTransaction = this.db.transaction('selectiveModeLinks', 'readonly');
      let selectiveLinksStore = selectiveTransaction.objectStore('selectiveModeLinks');

      let selectiveRequest = selectiveLinksStore.getAll();

      selectiveRequest.onsuccess = () => {
        subscriber.next(selectiveRequest.result);
      }

      selectiveRequest.onerror = () => {
        console.log('get links error', selectiveRequest.error)
        subscriber.error(selectiveRequest);
      }
    })
  }

  /**
   * Handler for add exclusion link by chosen mode
   * @param {string} mode
   * @param {ExclusionLink} link
   * @return {Observable<ExclusionLink>}
   */
  public addLink(mode: string, link: ExclusionLink): Observable<ExclusionLink> {
    return this.handler(() => this.addLinkHandler(mode, link));
  }

  /**
   * Adds exclusion link to needed section of data base by chosen mode
   * @param {string} mode
   * @param {ExclusionLink} link
   * @return {Observable<ExclusionLink>}
   */
  private addLinkHandler(mode: string, link: ExclusionLink): Observable<ExclusionLink> {
    return new Observable((subscriber) => {
      let transaction;
      let links;

      if (mode === 'regularMode') {
        transaction = this.db.transaction('regularModeLinks', 'readwrite');
        links = transaction.objectStore('regularModeLinks');
      }
      if (mode === 'selectiveMode') {
        transaction = this.db.transaction('selectiveModeLinks', 'readwrite');
        links = transaction.objectStore('selectiveModeLinks');
      }

      if (links) {
        let request = links.add(link);
        request.onsuccess = () => {
          console.log('link added', request.result);
          subscriber.next(link);
        }
  
        request.onerror = () => {
          console.log('link add error', request.error)
          subscriber.error(request);
        }
      }
    });
  }

  /**
   * Handler for remove exclusion link by chosen mode
   * @param {string} mode
   * @param {string} linkName
   * @return {Observable<any>}
   */
  public removeLink(mode: string, linkName: string): Observable<any> {
    return this.handler(() => this.removeLinkHandler(mode, linkName));
  }

  /**
   * Removes exclusion link from needed section of data base by chosen mode
   * @param {string} mode
   * @param {string} linkName
   * @return {Observable<any>}
   */
  private removeLinkHandler(mode: string, linkName: string): Observable<any> {
    return new Observable((subscriber) => {
      let transaction;
      let links;

      if (mode === 'regularMode') {
        transaction = this.db.transaction('regularModeLinks', 'readwrite');
        links = transaction.objectStore('regularModeLinks');
      }
      if (mode === 'selectiveMode') {
        transaction = this.db.transaction('selectiveModeLinks', 'readwrite');
        links = transaction.objectStore('selectiveModeLinks');
      }

      if (links) {
        let request = links.delete(linkName);

        request.onsuccess = () => {
          console.log('link removed');
          subscriber.next(request.result);
        }

        request.onerror = () => {
          console.log('link remove error')
          subscriber.error(request);
        }
      }
    })
  }

  /**
   * Handler for change exclusion link by chosen mode
   * @param {string} mode
   * @param {ExclusionLink} link
   * @return {Observable<any>}
   */
  public changeLink(mode: string, link: ExclusionLink): Observable<any> {
    return this.handler(() => this.changeLinkHandler(mode, link));
  }

  /**
   * Changes exclusion link in needed section of data base by chosen mode
   * @param {string} mode
   * @param {ExclusionLink} link
   * @return {Observable<any>}
   */
  private changeLinkHandler(mode: string, link: ExclusionLink): Observable<any> {
    return new Observable((subscriber) => {
      let transaction;
      let links;

      if (mode === 'regularMode') {
        transaction = this.db.transaction('regularModeLinks', 'readwrite');
        links = transaction.objectStore('regularModeLinks');
      }
      if (mode === 'selectiveMode') {
        transaction = this.db.transaction('selectiveModeLinks', 'readwrite');
        links = transaction.objectStore('selectiveModeLinks');
      }

      if (links) {
        let request = links.put(link);
        request.onsuccess = () => {
          console.log('link changed', request.result);
          subscriber.next(link);
        }
  
        request.onerror = () => {
          console.log('link change error', request.error)
          subscriber.error(request);
        }
      }
    })
  }

  /**
   * Handler for remove data base section by chosen mode
   * @param {string} mode 
   * @return {Observable<string>}
   */
  public removeDB(mode: string): Observable<string> {
    return this.handler(() => this.removeDBHandler(mode));
  }

  /**
   * Removes needed data base section by chosen mode
   * @param {string} mode
   * @return {Observable<string>}
   */
  private removeDBHandler(mode: string): Observable<string> {
    return new Observable((subscriber) => {
      let transaction;
      let links;

      if (mode === 'regularMode') {
        transaction = this.db.transaction('regularModeLinks', 'readwrite');
        links = transaction.objectStore('regularModeLinks');
      }
      if (mode === 'selectiveMode') {
        transaction = this.db.transaction('selectiveModeLinks', 'readwrite');
        links = transaction.objectStore('selectiveModeLinks');
      }

      if (links) {
        links.clear();
        subscriber.next(mode)
      }
    })
  }

}
