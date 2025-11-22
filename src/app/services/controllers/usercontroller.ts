import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { UserModel } from '../../models/usermodel';

@Injectable({
  providedIn: 'root'
})

export class UserController {
    constructor(private http: HttpClient) {}

    private apiURL = environment.apiUrl + '/user';

    getUsers() {
      return this.http.get<{token: string}>(`${this.apiURL}/users`);
    }

    getUser() {
      return this.http.get<{token: string}>(`${this.apiURL}/user`);
    }

    updatePassword(newPassword: string) {
      return this.http.patch<{token: string}>(`${this.apiURL}/user/updatePassword`, {
        newpassword: newPassword
      });
    }

    updateUser(user: UserModel) {
      return this.http.put<{token: string}>(`${this.apiURL}/user/update`, {
        user: user
      });
    }
}