import { Observable } from 'rxjs/Observable';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as fromAuth from '../../auth/reducers';
import * as layout from '../actions/layout';
import * as Auth from '../../auth/actions/auth';

import * as book from '../../videos/actions/book';

@Component({
  selector: 'bc-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bc-layout>
      <bc-sidenav [open]="showSidenav$ | async">
        <bc-nav-item (navigate)="closeSidenav()" routerLink="/videos" icon="favorite" hint="View your video collection">
          My Collection
        </bc-nav-item>
        <bc-nav-item (navigate)="closeSidenav()" routerLink="/videos/find" icon="search" hint="Find your next video!">
          Browse Videos
        </bc-nav-item>
        <bc-nav-item (navigate)="closeSidenav()" *ngIf="!(loggedIn$ | async)">
          Sign In
        </bc-nav-item>
        <bc-nav-item (navigate)="logout()" *ngIf="loggedIn$ | async">
          Sign Out
        </bc-nav-item>
      </bc-sidenav>

      <bc-toolbar (openMenu)="openSidenav()">
        <span class="powr-logo" routerLink="/"></span>
      </bc-toolbar>

      <router-outlet></router-outlet>
    </bc-layout>
  `,
  styles: [
    `
    .powr-logo {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANUAAABeCAMAAACD6aGqAAAC5VBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VfA0nAAAA9nRSTlMAAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxweHyAhIiMkJSYnKCkrLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWpr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);
      width: 107px;
      height: 47px;
      background-size: contain;
      cursor: pointer;
      margin-left: 30px;
    }
  `,
  ],
})
export class AppComponent implements OnInit {
  showSidenav$: Observable<boolean>;
  loggedIn$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>) {
    /**
     * Selectors can be applied with the `select` operator which passes the state
     * tree to the provided selector
     */
    this.showSidenav$ = this.store.pipe(select(fromRoot.getShowSidenav));
    this.loggedIn$ = this.store.pipe(select(fromAuth.getLoggedIn));
  }

  closeSidenav() {
    /**
     * All state updates are handled through dispatched actions in 'container'
     * components. This provides a clear, reproducible history of state
     * updates and user interaction through the life of our
     * application.
     */
    this.store.dispatch(new layout.CloseSidenav());
  }

  openSidenav() {
    this.store.dispatch(new layout.OpenSidenav());
  }

  logout() {
    this.closeSidenav();

    this.store.dispatch(new Auth.Logout());
  }

  ngOnInit() {
    console.log('parent', this.store);
    // this.store.dispatch(new book.Search('Michael Jordan'));
  }
}
