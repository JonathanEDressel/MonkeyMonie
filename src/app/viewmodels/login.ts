import { FormsModule } from '@angular/forms';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthData } from '../services/authdata';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: '../views/login.html',
  styleUrl: '../styles/login.scss'
})
export class LoginComponent implements OnInit {
  protected readonly title = signal('my-app');
  
  UserPassword: string = "";
  UserEmail: string = "";
  ErrorMsg = signal("");
  
  constructor(private router: Router, private _authData: AuthData) {
    this.ErrorMsg = this._authData.ErrorMsg;
  }

  ngOnInit(): void {
    this._authData.clearToken();
  }

  createAccount(): void {
    this.router.navigate(['/createaccount']);
  }

  forgotPassword(): void {
    this.router.navigate(['/forgotpassword'])
  }
  
  login(): void {
    this._authData.login(this.UserEmail, this.UserPassword);
  }
}
