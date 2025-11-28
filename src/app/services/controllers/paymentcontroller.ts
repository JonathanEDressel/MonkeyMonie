import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})

export class PaymentController {
    constructor(private http: HttpClient) {}

    private apiURL = environment.apiUrl + '/payment';


    addDonation(amount: string, method: string, notes: string) {
      return this.http.post<{token: string}>(`${this.apiURL}/donation/add`, {
        amount: amount,
        method: method,
        notes: notes
      });
    }

    getDonations() {
      return this.http.get<{token: string}>(`${this.apiURL}/donations`);
    }

    // getUserDonations(username: string) {
    //   return this.http.get<{token: string}>(`${this.apiURL}/donation/user`, {
    //     username: username
    //   });
    // }
}