import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, computed, signal } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { Observable } from 'rxjs';
import { CommonModule, formatCurrency } from '@angular/common';
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
    
    formatCurrency(val: number, dec: number = 0): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: dec}).format(val);
    }

    accountHistoryChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                titleFont: {
                    size: 15
                },
                bodyFont: {
                    size: 15
                },
                enabled: true,
                mode: 'index',
                intersect: false,
                usePointStyle: true,
                callbacks: {
                    title: function(ctx) {
                        return 'Date: ' + ctx[0].label;
                    },
                    label: function (ctx) {
                        var lbl = ' Balance: '; 
                        lbl += '$' + ctx.parsed.y?.toLocaleString();
                        return lbl;
                    }
                }
            },
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        weight: 'bold'
                    },
                    autoSkip: true,
                    padding: 10
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        weight: 'bold'
                    },
                    callback: function(value, idx, ticks) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0
                        }).format(Number(value));
                    }
                }
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