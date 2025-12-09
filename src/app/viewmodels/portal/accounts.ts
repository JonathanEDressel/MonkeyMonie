import { FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { Observable } from 'rxjs';
import { PersonalAccountModel } from '../../models/personalaccountmodel';
import { AsyncPipe } from '@angular/common';
import { CurrencyInput } from 'react-currency-input-field';
import {CurrencyMaskModule } from 'ng2-currency-mask';
import { CommonModule } from '@angular/common';
import { ModalPopup } from '../../shared/templateviewmodels/modal.component';

@Component({
  selector: 'accounts-root',
  standalone: true,
  imports: [FormsModule, AsyncPipe, CurrencyMaskModule, CommonModule, ModalPopup],
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

    deleteTitle = "Delete Account";
    deleteMsg = "Are you sure you want to delete this account?";
    showDeleteModal = false;
    idToDelete = 0;

    clearInputs(): void {
        this.acctBalance.set(0);
        this.acctType.set("");
        this.acctName.set("");
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
    }

    openDeleteModal(id: number, name: string) {
        this.showDeleteModal = true;
        this.idToDelete = id;
        this.deleteMsg = "Are you sure you want to delete \"" + name + "\" account?"
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

    removeAccount(): void {
        this.closeModal();
        this._acctData.removePersonalAccount(this.idToDelete);
        this.closeDeleteModal();
    }

    constructor(private _acctData: AcctData) {
        this.personalAccts$ = _acctData.personalAccounts$;
    }

    ngOnInit(): void {
        this.activate();
        this._acctData.getPersonalAccounts();
    }
    
    activate(): void {
    }
}