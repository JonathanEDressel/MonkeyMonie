import { Injectable, signal } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { EventModel } from "../models/eventmodel";
import { AdminController } from "./controllers/admincontroller";
import { CalendarEvent } from "angular-calendar";
import { AuthData } from "./authdata";
import { AuthController } from "./controllers/authcontroller";

@Injectable({
    providedIn: 'root'
})
export class AdminData {

    private eventSubject = new BehaviorSubject<EventModel[]>([]);
    userEvents$: Observable<EventModel[]> = this.eventSubject.asObservable();

    constructor(private _adminController: AdminController, private _authController: AuthController) {}

    ErrorMsg = signal("");

    getUserEvents(dte: string): any {
        return this._adminController.getUserEvents(dte).subscribe({
            next: (res: any) => {
                if(res.status === 200) {
                    const events: EventModel[] = [];
                    var data = res.result;
                    for(var i = 0; i < data.length; i++) {
                        var e = new EventModel();
                        e.assignData(data[i]);
                        events.push(e);
                    }
                    this.eventSubject.next(events);
                }
                else
                    console.warn('Failed to get accounts');
            },
            error: (err: any) => console.error(err)
        })
    }

    deleteUser(username: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._authController.deleteUser(username).subscribe({
                next: (res: any) => {
                    if(res.status === 200) {
                        alert('Account deleted')
                        resolve('');
                    }
                    else {
                        console.warn('Failed to get delete account');
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