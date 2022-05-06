import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {exhaustMap, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ExclusionDbService {

  private openRequest!: IDBOpenDBRequest;

  private db!: IDBDatabase;

  constructor() {
    console.log('IndexedDBService constructor');
  }

  private testIndexDBInit() {
    return new Observable((subscriber) => {
      this.openRequest = indexedDB.open('testDB', 1);
      this.openRequest.onupgradeneeded = () => {
        this.db = this.openRequest.result;

        if (!this.db.objectStoreNames.contains('links')) {
          this.db.createObjectStore('links', {autoIncrement: true});
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
      return this.testIndexDBInit()
        .pipe(exhaustMap(() => {
        return fn(...arguments);
      }));
    }
    return fn(...arguments);
  }

  public getLinks(): Observable<{link: string}[]> {
    return this.handler(this.getLinksHandler)
  }

  private getLinksHandler(): Observable<{link: string}[]> {
    return new Observable((subscriber) => {
      let transaction = this.db.transaction('links', 'readonly');
      let linksStore = transaction.objectStore('links');

      let request = linksStore.getAll();

      request.onsuccess = () => {
        subscriber.next(request.result);
      }

      request.onerror = () => {
        console.log('get links error', request.error)
        subscriber.error(request);
      }
    })
  }

  public addLink(link: string) {
    return this.handler(() => this.addLinkHandler(link));
  }

  private addLinkHandler(link: string): Observable<IDBRequest> {
    return new Observable((subscriber) => {
      let transaction = this.db.transaction('links', 'readwrite');
      let links = transaction.objectStore('links');

      let linkObject = {
        link,
        created: new Date()
      };

      let request = links.add(linkObject);

      request.onsuccess = () => {
        console.log('link added', request.result);
        subscriber.next(request);
      }

      request.onerror = () => {
        console.log('link add error', request.error)
        subscriber.error(request);
      }
    });
  }

  public removeLink() {
    return this.handler(this.removeLinkHandler);
  }

  private removeLinkHandler(linkId: number): Observable<any> {
    return new Observable((subscriber) => {
      let transaction = this.db.transaction('links', 'readwrite');
      let links = transaction.objectStore('links');

      let request = links.delete(linkId);

      request.onsuccess = () => {
        subscriber.next(request.result);
      }

      request.onerror = () => {
        subscriber.error(request);
      }
    })
  }

}
