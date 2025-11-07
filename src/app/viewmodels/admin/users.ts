import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { UserController } from '../../services/controllers/usercontroller';
import { AuthData } from '../../services/authdata';
import { UserData } from '../../services/userdata';
import { Observable } from 'rxjs';

@Component({
  selector: 'users-root',
  imports: [FormsModule],
  templateUrl: '../../views/admin/users.html',
  styleUrl: '../../styles/admin/users.scss'
})

export class UsersComponent  {
    portalPages: any[] = [];
    selectedPage: number = 1;

    isAdmin$: Observable<boolean>;
    
    constructor(private _usrData: UserData) {
        this.isAdmin$ = _usrData.isAdmin$;
    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        console.log('account tab called');
        this._usrData.getUsers();
    }
}