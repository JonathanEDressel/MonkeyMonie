import { CalendarMonthViewComponent, CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideCalendar } from 'angular-calendar';
import { DateAdapter } from 'angular-calendar';
import { FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { UserData } from '../../services/userdata';
import { AsyncPipe, NgIf } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AdminData } from '../../services/admindata';
import { EventModel } from '../../models/eventmodel';
import { Observable } from 'rxjs';

@Component({
  selector: 'users-root',
  standalone: true,
  imports: [FormsModule, AsyncPipe, DatePipe, CalendarMonthViewComponent, NgIf],
  templateUrl: '../../views/admin/sitestats.html',
  styleUrl: '../../styles/admin/sitestats.scss',
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
})

export class SiteStatsComponent  {
    
    userEvents$: Observable<EventModel[]>;

    _actvitiyMonthDate: string = new Date().toISOString().slice(0, 7);

    formatBase: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
    };

    calendarViewDate!: Date;

    monthEvents: CalendarEvent[] = [
        {
            start: new Date(),
            title: ''
        }
    ];

    set actvitiyMonthDate(val: string) {
        if (val !== this._actvitiyMonthDate) {
            this._actvitiyMonthDate = val;
            this.calendarViewDate = this.convertMonthStringToDate(val);
            this.onMonthYearChange();
        }
    }

    get actvitiyMonthDate(): string {
        return this._actvitiyMonthDate;
    }

    onMonthYearChange() {
        const [year, month] = this._actvitiyMonthDate.split('-');
        const formatted = `${month}/${year}`;

        this._admData.getUserEvents(formatted);
    }

    convertMonthStringToDate(monthYearString: string): Date {
        const fullDateString = `${monthYearString}-01T00:00:00`;
        return new Date(fullDateString);
    }

    constructor(private _admData: AdminData) {
        this.userEvents$ = _admData.userEvents$;
        this.calendarViewDate = this.convertMonthStringToDate(this._actvitiyMonthDate)
    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this.onMonthYearChange();
        // this.actvitiyMonthDate = new Date();
    }
}