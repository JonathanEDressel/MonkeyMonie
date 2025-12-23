import { Routes } from '@angular/router';
import { LoginComponent } from '../viewmodels/login'
import { CreateAccountComponent } from '../viewmodels/createaccount';
import { MainComponent } from '../viewmodels/main';
import { AuthGuard } from '../guards/auth-guard';
import { ForgotPassword } from '../viewmodels/forgotpassword';
import { AdminGuard } from '../guards/admin-guard';
import { AdminComponent } from '../viewmodels/admin/admin';
import { VerifyOTP } from '../viewmodels/verifyotp';
import { LandingComponent } from '../viewmodels/landing';

export const routes: Routes = [
    { path: 'landing', component: LandingComponent },
    { path: 'login', component: LoginComponent },
    { path: 'createaccount', component: CreateAccountComponent },
    { path: 'forgotpassword', component: ForgotPassword },
    { path: 'verifyotp', component: VerifyOTP },
    { path: 'main', component: MainComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard, AdminGuard] },
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];