import { Injectable, signal } from "@angular/core";
import { PaymentController } from "./controllers/paymentcontroller";

@Injectable({
    providedIn: 'root'
})
export class PaymentData {

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
}