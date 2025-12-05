import { Injectable, signal } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { EventModel } from "../models/eventmodel";
import { AdminController } from "./controllers/admincontroller";
import { CalendarEvent } from "angular-calendar";

@Injectable({
    providedIn: 'root'
})
export class AdminData {

    private eventSubject = new BehaviorSubject<EventModel[]>([]);
    userEvents$: Observable<EventModel[]> = this.eventSubject.asObservable();

    constructor(private _adminController: AdminController) {}

    ErrorMsg = signal("");

    getDayEvents(events: EventModel[]): CalendarEvent[] {
        var res: CalendarEvent[] = [];
        for (var i = 0; i < events.length; i++) {
            
        }

        return res;
    }

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
}