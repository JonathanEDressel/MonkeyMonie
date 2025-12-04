import { FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { UserData } from '../../services/userdata';
import { AsyncPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AdminData } from '../../services/admindata';
import { EventModel } from '../../models/eventmodel';
import { Observable } from 'rxjs';

@Component({
  selector: 'users-root',
  standalone: true,
  imports: [FormsModule, AsyncPipe, DatePipe],
  templateUrl: '../../views/admin/sitestats.html',
  styleUrl: '../../styles/admin/sitestats.scss'
})

export class SiteStatsComponent  {
    
    userEvents$: Observable<EventModel[]>;

    _actvitiyMonthDate: string = new Date().toISOString().slice(0, 7);

    formatBase: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
    };

    set actvitiyMonthDate(val: string) {
    if (val !== this._actvitiyMonthDate) {
        this._actvitiyMonthDate = val;
        this.onMonthYearChange();
    }
}

    get actvitiyMonthDate(): string {
        return this._actvitiyMonthDate;
    }

    onMonthYearChange() {
    setTimeout(() => {
        const [year, month] = this._actvitiyMonthDate.split('-');

        const formatted = `${month}/${year}`;

        this._admData.getUserEvents(formatted);
    }, 200);
}

    constructor(private _admData: AdminData) {
        this.userEvents$ = _admData.userEvents$;
    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this.onMonthYearChange();
        // this.actvitiyMonthDate = new Date();
    }
}