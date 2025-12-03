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

    constructor(private _admData: AdminData) {
        this.userEvents$ = _admData.userEvents$;
    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this._admData.getUserEvents();
    }
}