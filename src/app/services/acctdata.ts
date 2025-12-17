import { Injectable, Signal, signal } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { AcctController } from "./controllers/acctcontroller";
import { Router } from "@angular/router";
import { PersonalAccountModel } from "../models/personalaccountmodel";
import { PersonalAccountHistoryModel } from "../models/personalaccounthistorymodel";

@Injectable({
    providedIn: 'root'
})
export class AcctData {

    userPersonalAccounts: PersonalAccountModel[] = [];
    private personalActSubject = new BehaviorSubject<PersonalAccountModel[]>([]);
    personalAccounts$: Observable<PersonalAccountModel[]> = this.personalActSubject.asObservable();

    userPersonalAccountHistory: PersonalAccountModel[] = [];
    private personalActHistSubject = new BehaviorSubject<PersonalAccountModel[]>([]);
    personalActHistory$: Observable<PersonalAccountModel[]> = this.personalActHistSubject.asObservable();

    constructor(private _acctController: AcctController) {}

    ErrorMsg = signal("");

    addPersonalAccount(acctName: string, acctType: string, acctBalance: number): any {
        this._acctController.addPersonalAccount(acctName, acctType, acctBalance).subscribe({
            next: (res: any) => {
                if(res.status === 200) {
                    console.log(`${acctName} added`);
                    var tmp = new PersonalAccountModel();
                    tmp.assignData(res.result);
                    
                    const accounts = this.personalActSubject.value;
                    this.personalActSubject.next([...accounts, tmp]);
                }
                else {
                    console.warn(`Failed to add account ${acctName}`);
                }
            },
            error: (err: any) => console.error(err)
        });
    }

    updatePersonalAccount(account: PersonalAccountModel): any {
        this._acctController.updatePersonalAccount(account).subscribe({
            next: (res: any) => {
                if(res.status === 200) {
                    console.log('Account updated');
                    var accounts = this.personalActSubject.value;
                    var act = accounts.find(a => a.Id === account.Id) ?? undefined; //new PersonalAccountModel();
                    if(act) {
                        act.Balance = account.Balance;
                        act.Type = account.Type;
                        act.Name = account.Name;

                        accounts = accounts.filter(a => a.Id !== act?.Id);
                        accounts.push(act);
                        this.personalActSubject.next([...accounts]);
                    }
                }
                else    
                    console.warn('Account failed to delete');
            },
            error: (err: any) => console.error(err)
        })
    }

    removePersonalAccount(Id: number): any {
        this._acctController.removePersonalAccount(Id).subscribe({
            next: (res: any) => {
                if(res.status === 200) {
                    console.log('Account deleted');
                    const accounts = this.personalActSubject.value;
                    const result = accounts.filter(act => act.Id !== Id);
                    this.personalActSubject.next([...result]);
                }
                else    
                    console.warn('Account failed to delete');
            },
            error: (err: any) => console.error(err)
        })
    }

    getPersonalAccounts(): any {
        return new Promise((resolve, reject) => {
            this._acctController.getPersonalAccounts().subscribe({
                next: (res: any) => {
                    if(res.status === 200) {
                        const accounts: PersonalAccountModel[] = [];
                        var data = res.result;
                        for(var i = 0; i < data.length; i++) {
                            var acct = new PersonalAccountModel();
                            acct.assignData(data[i]);
                            accounts.push(acct);
                        }
                        this.personalActSubject.next(accounts);
                        resolve(accounts);
                    }
                    else {
                        console.warn('Failed to get accounts');
                        reject('Bad status: ' + res.status);
                    }
                },
                error: (err: any) => { 
                    console.error(err);
                    reject(err);
                }
            });
        });
    }

    getPersonalAccountHistory(): Promise<PersonalAccountModel[]> {
        return new Promise((resolve, reject) => {
            this._acctController.getPersonalAccountHistory().subscribe({
                next: (res: any) => {
                    if(res.status === 200) {
                        const accounts: PersonalAccountModel[] = [];
                        var data = res.result;
                        for(var i = 0; i < data.length; i++) {
                            var tmp = new PersonalAccountModel();
                            tmp.assignData(data[i]);
                            accounts.push(tmp);
                        }
                        this.personalActHistSubject.next(accounts);
                        resolve(accounts);
                    }
                    else {
                        console.warn('Failed to get account history');
                        reject('Bad status: ' + res.status);
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    reject(err);
                }
            });
        });
    }
}