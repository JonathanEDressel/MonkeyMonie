import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { PersonalAccountModel } from '../../models/personalaccountmodel';

@Injectable({
  providedIn: 'root'
})

export class AcctController {
    constructor(private http: HttpClient) {}

    private apiURL = environment.apiUrl + '/act';

    addPersonalAccount(acctName: string, acctType: string, acctBalance: number) {
        return this.http.post<{ token: string }>(`${this.apiURL}/add/personal`, { 
            name: acctName,
            type: acctType,
            balance: acctBalance
        });
    }

    updatePersonalAccount(account: PersonalAccountModel) {
        return this.http.patch<{ token: string }>(`${this.apiURL}/update/personal/` + account.Id, { 
            name: account.Name,
            type: account.Type,
            balance: account.Balance
        });
    }

    removePersonalAccount(Id: number) {
        return this.http.delete<{ token: string}>(`${this.apiURL}/remove/personal/` + Id);
    }

    getPersonalAccounts(): any {
        return this.http.get<{token: string}>(`${this.apiURL}/personal`);
    }
}