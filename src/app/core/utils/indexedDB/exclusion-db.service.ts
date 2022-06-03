import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {exhaustMap} from "rxjs/operators";
import {ExclusionLink} from "../../models/exclusion-link.model";

@Injectable({
  providedIn: 'root'
})
export class ExclusionDbService {

  private openRequest!: IDBOpenDBRequest;

  private db!: IDBDatabase;

  constructor() {
    console.log('IndexedDBService constructor');
  }

  private exclusionsIndexDBInit() {
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
          console.log("База данных устарела, пожалуста, перезагрузите страницу.")
        };

        subscriber.next(this.db);
      };
    })
  }

  private handler(fn: Function): Observable<any> {
    fn = fn.bind(this);
    if (!this.openRequest?.result) {
      return this.exclusionsIndexDBInit()
        .pipe(exhaustMap(() => {
        return fn();
      }));
    }
    return fn();
  }

  public getRegularLinks(): Observable<ExclusionLink[]> {
    return this.handler(this.getRegularLinksHandler)
  }

  public getSelectiveLinks(): Observable<ExclusionLink[]> {
    return this.handler(this.getSelectiveLinksHandler)
  }

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

  public addLink(mode: string, link: ExclusionLink): Observable<ExclusionLink> {
    return this.handler(() => this.addLinkHandler(mode, link));
  }

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

  public removeLink(mode: string, linkName: string): Observable<any> {
    return this.handler(() => this.removeLinkHandler(mode, linkName));
  }

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

  public changeLink(mode: string, link: ExclusionLink) {
    return this.handler(() => this.changeLinkHandler(mode, link));
  }

  private changeLinkHandler(mode: string, link: ExclusionLink) {
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

  public removeDB(mode: string): Observable<string> {
    return this.handler(() => this.removeDBHandler(mode));
  }

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
