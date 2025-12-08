import { Injectable, signal } from "@angular/core";
import { PaymentController } from "./controllers/paymentcontroller";
import { DonationModel } from "../models/donationmodel";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PaymentData {

    private donationActSubject = new BehaviorSubject<DonationModel[]>([]);
    userDonation$: Observable<DonationModel[]> = this.donationActSubject.asObservable();

    constructor(private _paymentController: PaymentController) {}

    addDonation(amount: string, method: string, notes: string): void {
      this._paymentController.addDonation(amount, method, notes).subscribe({
        next: (res: any) => {
        //   if(res.status === 200) {
        //   }
          alert(res.result);
        }
      })
    }

    getDonations(): void {
        this._paymentController.getDonations().subscribe({
          next: (res: any) => {
              if(res.status === 200) {
                const donations: DonationModel[] = [];
                var data = res.result;
                for(var i = 0; i < data.length; i++) {
                  var acct = new DonationModel();
                  acct.assignData(data[i]);
                  donations.push(acct);
                }
                this.donationActSubject.next(donations);
              }
              else
                console.warn('Failed to get donations');
          },
        error: (err) => console.error(err)
      });
    }
}