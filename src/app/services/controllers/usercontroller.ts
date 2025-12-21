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
      return this.http.post<{token: string}>(`${this.apiURL}/updatePassword`, {
        newpassword: newPassword
      });
    }

    updateUserPassword(userid: number, newPassword: string) {
      return this.http.post<{token: string}>(`${this.apiURL}/updateUserPassword`, {
        newpassword: newPassword,
        userid: userid
      });
    }

    updateUser(user: UserModel) {
      return this.http.post<{token: string}>(`${this.apiURL}/update`, {
        user: user
      });
    }
}