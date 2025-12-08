import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { UserData } from '../../services/userdata';
import { Observable } from 'rxjs';
import { UserModel } from '../../models/usermodel';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'overview-root',
  imports: [FormsModule, AsyncPipe],
  templateUrl: '../../views/portal/profile.html',
  styleUrl: '../../styles/portal/profile.scss'
})

export class ProfileComponent implements OnInit {

    user$: Observable<UserModel | null>;
    
    newPassword: string = "";
    confirmPassword: string = "";

    constructor(private _usrData: UserData) {
        this.user$ = _usrData.user$;
    }

    clearPasswords(): void {
        this.newPassword = "";
        this.confirmPassword = "";
    }

    resetPassword(): void {
        //call to reset password
        this._usrData.updatePassword(this.newPassword); 
        this.clearPasswords();
    }

    saveChanges(user: UserModel): void {
        //call to save changes
        this._usrData.updateUser(user);
    }

    ngOnInit(): void {
        this._usrData.getUser();
    }

    activate(): void {
        console.log('profile tab called');
    }

}