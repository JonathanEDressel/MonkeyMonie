import { Injectable, numberAttribute, signal } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { EventModel } from "../models/eventmodel";
import { AdminController } from "./controllers/admincontroller";
import { CalendarEvent } from "angular-calendar";
import { AuthData } from "./authdata";
import { AuthController } from "./controllers/authcontroller";
import { ErrorLogModel } from "../models/errorlogmodel";

@Injectable({
    providedIn: 'root'
})
export class AdminData {

    private eventSubject = new BehaviorSubject<EventModel[]>([]);
    userEvents$: Observable<EventModel[]> = this.eventSubject.asObservable();

    private errorSubject = new BehaviorSubject<ErrorLogModel[]>([]);
    errorLogs$: Observable<ErrorLogModel[]> = this.errorSubject.asObservable();

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

    getErrorLog(day: number, month: number, year: number): any {
        return this._adminController.getErrorLog(day, month, year).subscribe({
            next: (res: any) => {
                if(res.status === 200) {
                    const logs: ErrorLogModel[] = [];
                    var data = res.result;
                    for(var i = 0; i < data.length; i++) {
                        var tmp = new ErrorLogModel();
                        tmp.assignData(data[i]);
                        logs.push(tmp);
                    }
                    this.errorSubject.next(logs);
                }

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

    constructor(private _adminController: AdminController, private _authController: AuthController) {}
}