import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthData } from '../services/authdata';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [FormsModule],
  templateUrl: '../views/forgotpassword.html',
  styleUrl: '../styles/forgotpassword.scss'
})

export class ForgotPassword implements OnInit {

  userEmail: string = "";

  constructor(private router: Router, private _authData: AuthData) {}
  
  ngOnInit(): void {
  }

  returnToLogin(): void {
    this.router.navigate(['/login']);
  }

  sendVerificationCode(): void {
    this._authData.forgotPassword(this.userEmail);
    this.userEmail = "";
  }
}