import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, computed, signal } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions, ElementChartOptions } from 'chart.js';
import { AgChartOptions } from 'ag-charts-community';
import { BaseChartDirective } from "ng2-charts";
import { PersonalAccountModel } from '../../models/personalaccountmodel';


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

    personalRecords$: Observable<PersonalAccountModel[]>;
    
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

    onToggle() {
        this.cdr.detectChanges();
    }

    constructor(private _actData: AcctData, private cdr: ChangeDetectorRef) {
        this.personalRecords$ = this._actData.personalActHistory$;
    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this._actData.getPersonalAccountHistory().then(res => {
            console.log('This is how you do a then in a promise')
        })
        .catch((err) => console.error(err));
    }
}