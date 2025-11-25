import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { UserController } from '../../services/controllers/usercontroller';
import { AuthData } from '../../services/authdata';
import { UserData } from '../../services/userdata';
import { Observable } from 'rxjs';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersComponent } from './users';

@Component({
  selector: 'admin-root',
  imports: [FormsModule, RouterLink, NgComponentOutlet, AsyncPipe],
  templateUrl: '../../views/admin/admin.html',
  styleUrl: '../../styles/admin/admin.scss'
})

export class AdminComponent  {
    portalPages: any[] = [];
    selectedPage: number = 1;

    isAdmin$: Observable<boolean>;

    constructor(private _usrController: UserController, private _usrData: UserData, private _authData: AuthData) {
        this.isAdmin$ = _usrData.isAdmin$;
        this.portalPages = this.createPages();
    }

    createPages() {
        return [
            { Id: 1, Title: 'Users', class: "", Route: '/admin', Visible$: this.isAdmin$, isSelected: Observable<false>, View: UsersComponent },
            { Id: 2, Title: 'Site Statistics', class: "", Route: '/admin', Visible$: this.isAdmin$, isSelected: Observable<false>, View: UsersComponent },
            { Id: 3, Title: 'Payment Details', class: "", Route: '/admin', Visible$: this.isAdmin$, isSelected: Observable<false>, View: UsersComponent },
            { Id: 4, Title: 'Settings', class: "", Route: '/admin', Visible$: this.isAdmin$, isSelected: Observable<false>, View: UsersComponent },
        ];
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
        this.activate();
    }

    activate(): void {
        this._usrData.getUsers();
    }

    logout(): void {
      this._authData.logout();
    }
}