import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { UserData } from '../services/userdata';
import { UserModel } from '../models/usermodel';
import { Observable } from 'rxjs';
import { RouterLink } from "@angular/router";
import { NgComponentOutlet, AsyncPipe } from '@angular/common';
import { OverviewComponent } from './portal/overview';
import { HistoryComponent } from './portal/history';
import { AccountsComponent } from './portal/accounts';
import { ProfileComponent } from './portal/profile';
import { AdminComponent } from './admin/admin';
import { AuthData } from '../services/authdata';

@Component({
  selector: 'main-root',
  imports: [FormsModule, RouterLink, NgComponentOutlet, AsyncPipe],
  templateUrl: '../views/main.html',
  styleUrl: '../styles/main.scss'
})
export class MainComponent {
    portalPages: any[] = [];
    selectedPage: number = 2;

    user$: Observable<UserModel | null>;
    isAdmin$: Observable<boolean>;

    constructor(private _usrData: UserData, private _authData: AuthData) {
      this.user$ = _usrData.user$;
      this.isAdmin$ = _usrData.isAdmin$;
      this.portalPages = this.createPages();
      // this.user2 = this._usrData.currentUser;
    }

    createPages() {
      return [
        { Id: 1, Title: 'Admin', class: "", Route: '/admin', Visible$: this.isAdmin$, isSelected: Observable<false>, View: AdminComponent },
        { Id: 2, Title: 'Overview', class: "", Route: '/main', Visible$: this.setDefBool(true), isSelected: Observable<false>, View: OverviewComponent },
        { Id: 3, Title: 'History', class: "", Route: '/main', Visible$: this.setDefBool(true), isSelected: Observable<false>, View: HistoryComponent },
        { Id: 4, Title: 'Account', class: "", Route: '/main', Visible$: this.setDefBool(true), isSelected: Observable<false>, View: AccountsComponent },
        { Id: 5, Title: 'Profile', class: "", Route: '/main', Visible$: this.setDefBool(true), isSelected: Observable<false>, View: ProfileComponent }
      ];
    }

    setDefBool(data: boolean): Observable<boolean> {
      return new Observable(obs => {
        obs.next(data);
        obs.complete();
      })
    }

    get getPage() {
      var page = this.portalPages.find(pg => this.selectedPage === pg.Id);
      return page?.View ?? null;
    }    

    setPage(page: any): void {
      this.selectedPage = page.Id;
    }

    ngOnInit(): void {
      this._usrData.getUser();
    }

    activate(): void {
    }

    logout(): void {
      this._authData.logout();
    }
}