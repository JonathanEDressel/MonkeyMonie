import { FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { UserController } from '../../services/controllers/usercontroller';
import { AuthData } from '../../services/authdata';
import { UserData } from '../../services/userdata';
import { Observable } from 'rxjs';
import { UserModel } from '../../models/usermodel';
import { AsyncPipe } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'users-root',
  standalone: true,
  imports: [FormsModule, AsyncPipe, DatePipe],
  templateUrl: '../../views/admin/users.html',
  styleUrl: '../../styles/admin/users.scss'
})

export class UsersComponent  {
    selectedUser = signal(new UserModel);
    portalPages: any[] = [];
    selectedPage: number = 1;

    isAdmin$: Observable<boolean>;
    users$: Observable<UserModel[]>;
    
    constructor(private _usrData: UserData) {
        this.isAdmin$ = _usrData.isAdmin$;
        this.users$ = _usrData.userList$;
    }

    saveUser(usr: UserModel) {
        console.log('save user - ', usr)
    }

    clearAccount() {
        this.selectedUser.set(new UserModel());
    }

    selectAccount(usr: UserModel) {
        this.selectedUser.set(usr);
    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this._usrData.getUsers();
    }
}