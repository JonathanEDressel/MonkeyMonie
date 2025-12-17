import { FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { UserData } from '../../services/userdata';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { UserModel } from '../../models/usermodel';
import { AsyncPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AdminData } from '../../services/admindata';

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

    newPassword: string = "";
    confirmPassword: string = "";

    isAdmin$: Observable<boolean>;
    users$: Observable<UserModel[]>;

    searchText: string = "";
    filter$: BehaviorSubject<string> = new BehaviorSubject<string>("");
    usersFiltered$!: Observable<UserModel[]>;

    constructor(private _usrData: UserData, private _adminData: AdminData) {
        this.isAdmin$ = _usrData.isAdmin$;
        this.users$ = _usrData.userList$;
        this.createUserFilter();
    }

    createUserFilter(): void {
        this.usersFiltered$ = combineLatest([
            this.users$,
            this.filter$
        ]).pipe(
            map(([users, filter]) =>
                users.filter(u => {
                        var fullName = (u.FirstName + ' ' + u.LastName).toLowerCase();
                        var username = u.Username.toLowerCase();
                        var email = u.Email.toLowerCase();
                        var f = filter.toLowerCase();

                        return fullName.includes(f) || username.includes(f) || email.includes(f);
                    }
                )
                .sort((a, b) => {
                    return (b.IsActive === a.IsActive) ? 0 : b.IsActive ? 1 : -1;
                })
            )
        );
    }

    deleteUser(usr: UserModel): void {
        this._adminData.deleteUser(usr.Username)
            .then(() => {
                this.createUserFilter();
                this.users$ = this._usrData.userList$;
            });
    }

    clearPasswords(): void {
        this.newPassword = "";
        this.confirmPassword = "";
    }

    resetPassword(): void {
        this._usrData.updateUserPassword(this.selectedUser().Id, this.newPassword); 
        this.clearPasswords();
    }

    saveUser(usr: UserModel) {
        this._usrData.updateUser(usr);
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