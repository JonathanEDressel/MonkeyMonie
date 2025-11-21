import { FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { Observable } from 'rxjs';
import { PersonalAccountModel } from '../../models/personalaccountmodel';
import { AsyncPipe } from '@angular/common';
import { CurrencyInput } from 'react-currency-input-field';
import {CurrencyMaskModule } from 'ng2-currency-mask';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'accounts-root',
  imports: [FormsModule, AsyncPipe, CurrencyMaskModule, CommonModule],
  templateUrl: '../../views/portal/accounts.html',
  styleUrl: '../../styles/portal/accounts.scss'
})

export class AccountsComponent {
    showModal = signal(false);
    selectedAccount = signal(new PersonalAccountModel());

    acctName = signal("");
    acctType = signal("");
    acctBalance = signal(0);
    personalAccts$: Observable<PersonalAccountModel[]>;

    constructor(private _acctData: AcctData) {
        this.personalAccts$ = _acctData.personalAccounts$;
    }

    clearInputs(): void {
        this.acctBalance.set(0);
        this.acctType.set("");
        this.acctName.set("");
    }

    ngOnInit(): void {
        this.activate();
        this._acctData.getPersonalAccounts();
    }

    activate(): void {
    }

    addAccount(): void {
        this._acctData.addPersonalAccount(this.acctName(), this.acctType(), this.acctBalance());
        this.clearInputs();
    }

    selectAccount(account: PersonalAccountModel) {
        this.showModal.set(true);
        this.selectedAccount.set(account);
    }

    closeModal() {
        this.showModal.set(false);
    }

    updateAccount(account: PersonalAccountModel) {
        this._acctData.updatePersonalAccount(account);
        this.closeModal();
    }

    removeAccount(id: number): void {
        this.closeModal();
        this._acctData.removePersonalAccount(id);
    }
}