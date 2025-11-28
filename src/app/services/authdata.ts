import { Injectable, Signal, signal } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { AuthController } from "./controllers/authcontroller";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthData {

    constructor(private router: Router,private _authController: AuthController) {}

    isAdminUser = signal(false);
    ErrorMsg = signal("");

    private tokenKey = 'jwt';

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    clearToken(): void {
        localStorage.removeItem(this.tokenKey);
    }

    decodeToken(token: string): any | null {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token)
            return false;
        
        const payload = this.decodeToken(token);
        if (payload && payload.exp && (Date.now()) >= (payload.exp * 1000)) {
            this.logout();
            return false;
        }
        return true;
    }

    isAdmin(): Observable<boolean> {
        return this._authController.isAdmin().pipe(
            map((res: any) =>{ 
                return res?.status === 200 && res.result === true ;
            }),
        );
    }

    logout(): void {
        this.clearToken();
        this.router.navigate(['/login']);
    }

    login(username: string, password: string): any {
        this._authController.login(username, password).subscribe({
            next: (res: any) => {
                console.log('User logged in');
                localStorage.setItem('jwt', res.token);
                this.router.navigate(['/main']);
            },
            error: (err: any) => {
                this.ErrorMsg.set("Invalid credentials");
                console.error("ERROR: " + err, this.ErrorMsg)
            }
      });
    }
    
    createAccount(firstname: string, lastname: string, email: string, password: string,phonenumber: string): void {
      this._authController.createAccount(firstname, lastname, email, password, phonenumber).subscribe({
        next: (res: any) => {
            if(res?.token) {
                localStorage.setItem('jwt', res.token);
                this.router.navigate(['/main'])
                this.ErrorMsg.set("");
                console.log("Account created");
            }
        },
        error: (err) => {
          this.ErrorMsg.set("Invalid credentials");
          console.error("ERROR: " + err)
        }
      });
    }

    forgotPassword(email: string): any {
        this._authController.forgotPassword(email).subscribe({
            next: (res: any) => {
                this.router.navigate(['verifyotp']);
            },
            error: (err) => {
                alert(err);
                console.error("ERROR: " + err)
            }
        })
    }

    checkVerificationCode(otptoken: string): any {
        const username = (String) (sessionStorage.getItem('username'));
        this._authController.checkVerificationCode(username, otptoken).subscribe({
             next: (res: any) => {
                console.log('User logged in');
                localStorage.setItem('jwt', res.token);
                this.router.navigate(['/main']);
            },
            error: (err: any) => {
                this.ErrorMsg.set("Invalid credentials");
                console.error("ERROR: " + err, this.ErrorMsg)
            }
        })
    }
}