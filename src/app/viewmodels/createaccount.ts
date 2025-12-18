import { EmailValidator, FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { UserModel } from '../models/usermodel';
import { Router } from '@angular/router';
import { AuthData } from '../services/authdata';


@Component({
  selector: 'createaccount-root',
  imports: [FormsModule],
  templateUrl: '../views/createaccount.html',
  styleUrl: '../styles/createaccount.scss'
})
export class CreateAccountComponent {
    user: UserModel = new UserModel();
    password: string = "";
    ErrorMsg = signal("");

    constructor(private router: Router, private _authData: AuthData) {
      _authData.ErrorMsg.set("");
      this.ErrorMsg = _authData.ErrorMsg;
    }

    returnToLogin(): void {
      this.router.navigate(['/login']);
    }
    
    createAccount(): void {
      this._authData.createAccount(this.user.FirstName, this.user.LastName, this.user.Email, this.password, this.user.PhoneNumber);
    }
}