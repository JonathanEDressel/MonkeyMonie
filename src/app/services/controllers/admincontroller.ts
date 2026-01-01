import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})

export class AdminController {
    constructor(private http: HttpClient) {}

    private apiURL = environment.apiUrl;

    getUserEvents(dte: string): any {
      return this.http.post<{token: string}>(`${this.apiURL}/event/events`, {
        date: dte
      });
    }

    getErrorLog(day: number, month: number, year: number): any {
      return this.http.post<{token: string}>(`${this.apiURL}/errors/logs`, {
        day: day,
        month: month,
        year: year
      })
    }
}