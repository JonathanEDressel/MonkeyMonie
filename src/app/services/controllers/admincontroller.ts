import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})

export class AdminController {
    constructor(private http: HttpClient) {}

    private apiURL = environment.apiUrl + '/event';

    getUserEvents(dte: string): any {
        return this.http.post<{token: string}>(`${this.apiURL}/events`, {
          date: dte
        });
    }
}