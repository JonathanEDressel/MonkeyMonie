import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthData } from '../services/authdata';

@Component({
  selector: 'app-verifyotp',
  standalone: true,
  imports: [FormsModule],
  templateUrl: '../views/verifyotp.html',
  styleUrl: '../styles/verifyotp.scss'
})

export class VerifyOTP implements OnInit {

  otpCode = signal("");

  constructor(private router: Router, private _authData: AuthData) {}
  
  ngOnInit(): void {
  }

  returnToLogin(): void {
    this.router.navigate(['/login']);
  }

  checkVerificationCode(): void {
    this._authData.checkVerificationCode(this.otpCode());
  }
}