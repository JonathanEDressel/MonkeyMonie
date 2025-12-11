import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, computed, signal } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions, ElementChartOptions } from 'chart.js';
import { AgChartOptions } from 'ag-charts-community';
import { BaseChartDirective } from "ng2-charts";


interface Record {
    Date: Date;
    Balance: string;
}

@Component({
  selector: 'history-root',
  imports: [FormsModule, CommonModule, BaseChartDirective],
  templateUrl: '../../views/portal/history.html',
  styleUrl: '../../styles/portal/history.scss'
})

export class HistoryComponent {

    historyRaw = signal<any[]>([]);

    formatCurrency(val: number,dec: number = 0): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: dec}).format(val);
    }

    accountHistoryChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: true
                }
            },
            y: {
                beginAtZero: false
            }
        }
    };

    accountHistoryChartData: ChartData<'line'> = {
        labels: ['January', 'February', 'March', 'April'],
        datasets: [
            {
                label: 'Balance $',
                data: [5000, 4500, 6000, 9000],
                fill: false,
                tension: 0.3
            }
        ],
    }

    mappedRecords = computed(() => {
        const items = this.historyRaw();
        const trackAccounts = new Map<string, Record[]>();
        items.forEach(x => {
            const key = `${x.AccountId}-${x.Name}`;
            const tmp: Record = {
                Date: new Date(x.RecordedDate),
                Balance: this.formatCurrency(x.Balance),
            };
            var list: Record[] = [];
            if (trackAccounts.has(key)) {
                list = trackAccounts.get(key) ?? [];
            }
            list.push(tmp);
            list.sort((a, b) => b.Date.getTime() - a.Date.getTime());
            trackAccounts.set(key, list);
        });
        return trackAccounts;
    });

    cleanKey(key: string): string {
        return key.replace(/^\d+-/, '');
    }

    onToggle() {
        this.cdr.detectChanges();
    }

    constructor(private _actData: AcctData, private cdr: ChangeDetectorRef) {
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