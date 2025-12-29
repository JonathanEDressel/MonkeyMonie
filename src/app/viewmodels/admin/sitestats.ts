import { CalendarMonthViewComponent, CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideCalendar } from 'angular-calendar';
import { DateAdapter } from 'angular-calendar';
import { FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { UserData } from '../../services/userdata';
import { NgIf, DatePipe } from '@angular/common';
import { AdminData } from '../../services/admindata';
import { EventModel } from '../../models/eventmodel';
import { Observable } from 'rxjs';

@Component({
  selector: 'users-root',
  standalone: true,
    imports: [FormsModule, NgIf, DatePipe, CalendarMonthViewComponent],
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
    allEvents: EventModel[] = [];
    displayEvents: EventModel[] = [];

    _actvitiyMonthDate: string = new Date().toISOString().slice(0, 7);

    formatBase: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
    };

    calendarViewDate!: Date;

    monthEvents: CalendarEvent[] = [];

    selectedDate: Date | null = null;

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

    constructor(private _admData: AdminData, private datePipe: DatePipe) {
        this.userEvents$ = _admData.userEvents$;
        this.calendarViewDate = this.convertMonthStringToDate(this._actvitiyMonthDate)

        // Recompute calendar events and filtered table whenever admin events change
        this.userEvents$.subscribe((events) => {
            this.allEvents = events || [];
            this.buildMonthEvents();
            // Default selected day: today within current view month
            if (!this.selectedDate) {
                this.selectedDate = this.calendarViewDate;
            }
            this.filterDisplayEvents();
        });
    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this.onMonthYearChange();
        // this.actvitiyMonthDate = new Date();
    }

    onDayClicked($event: any): void {
        // $event can be {date: Date, events: CalendarEvent[]} from angular-calendar
        const date: Date = $event?.date ?? null;
        if (date) {
            this.selectedDate = date;
            this.filterDisplayEvents();
        }
    }

    private sameDay(d1: Date, d2: Date): boolean {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    private filterDisplayEvents(): void {
        if (!this.selectedDate) {
            this.displayEvents = [];
            return;
        }
        const day = this.selectedDate;
        const selKey = this.datePipe.transform(day, 'yyyy-MM-dd');
        this.displayEvents = this.allEvents.filter(e => {
            if (!e?.EventTimeStamp) return false;
            const key = this.getEventDateKey(e.EventTimeStamp);
            return e.EventType === 'Login' && key === selKey;
        });
    }

    private buildMonthEvents(): void {
        const counts = new Map<string, number>();
        for (const e of this.allEvents) {
            if (e.EventType !== 'Login' || !e.EventTimeStamp) continue;
            const key = this.getEventDateKey(e.EventTimeStamp);
            if (!key) continue;
            counts.set(key, (counts.get(key) || 0) + 1);
        }

        const events: CalendarEvent[] = [];
        counts.forEach((count, key) => {
            const [y, m, d] = key.split('-').map(n => parseInt(n, 10));
            const dt = new Date(y, m - 1, d);
            events.push({
                start: dt,
                title: '',
                color: { primary: '#dc3545', secondary: '#ffe3e6' },
                meta: { count }
            } as any);
        });
        this.monthEvents = events;
    }

    private getEventDateKey(ts: any): string | null {
        try {
            if (!ts) return null;
            let d: Date;
            if (ts instanceof Date) {
                d = ts as Date;
            } else if (typeof ts === 'string') {
                // Normalize common formats: "YYYY-MM-DD HH:mm:ss" to ISO by replacing space with 'T'
                const norm = ts.includes(' ') && !ts.includes('T') ? ts.replace(' ', 'T') : ts;
                d = new Date(norm);
            } else {
                d = new Date(ts);
            }
            if (isNaN(d.getTime())) return null;
            return this.datePipe.transform(d, 'yyyy-MM-dd');
        } catch {
            return null;
        }
    }
}