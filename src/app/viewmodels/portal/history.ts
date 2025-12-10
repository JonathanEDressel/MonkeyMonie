import { FormsModule } from '@angular/forms';
import { Component, computed, signal } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

interface Record {
    Date: string;
    Balance: number;
}

@Component({
  selector: 'history-root',
  imports: [FormsModule, CommonModule],
  templateUrl: '../../views/portal/history.html',
  styleUrl: '../../styles/portal/history.scss'
})

export class HistoryComponent {
    historyRaw = signal<any[]>([]);

    mappedRecords = computed(() => {
        const items = this.historyRaw();
        const trackAccounts = new Map<string, Record[]>();
        items.forEach(x => {
            const key = `${x.AccountId}-${x.Name}`;
            const tmp: Record = {
                Date: x.RecordedDate,
                Balance: x.Balance,
            };

            if (trackAccounts.has(key)) {
                var list = trackAccounts.get(key) ?? [];
                list.push(tmp);
                trackAccounts.set(key, list);
            }
            else
                trackAccounts.set(key, [tmp]);
        });
        console.log(trackAccounts)
        return trackAccounts;
    });

    constructor(private _actData: AcctData) {

    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this._actData.getPersonalAccountHistory().then(res => {
            this.historyRaw.set(res);
        })
        .catch((err) => console.error(err));
    }
}