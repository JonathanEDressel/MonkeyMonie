import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, computed, QueryList, signal, ViewChildren } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions, ElementChartOptions } from 'chart.js';
import { AgChartOptions } from 'ag-charts-community';
import { BaseChartDirective } from "ng2-charts";
import { PersonalAccountModel } from '../../models/personalaccountmodel';
import { InfoPanelComponent } from "../shared/info.component";
import { MainComponent } from '../main';
import { applyTooltipTheme, ChartHandle, createChartHandle } from '../../shared/chart-helpers';


interface Record {
    Date: Date;
    Balance: string;
}

@Component({
  selector: 'history-root',
  imports: [FormsModule, CommonModule, BaseChartDirective, InfoPanelComponent],
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
                    autoSkip: true,         
                    maxTicksLimit: 10,     
                    callback: function(value, index, ticks) {
                        const date = new Date(this.getLabelForValue(Number(value)));
                        return `${date.getMonth()+1}/${date.getDate()}`;
                    },
                    maxRotation: 0,
                    minRotation: 0
                },
                grid: {
                    display: false          
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                    return `$${value.toLocaleString()}`; 
                },
                maxTicksLimit: 10
                },
                grid: {
                    lineWidth: 1,
                    color: 'rgba(0,0,0,0.05)',
                },
                border: {
                    color: 'rgba(0,0,0,0.1)',  
                    width: 1
                }
            }
        },
        elements: {
            line: {
                tension: 0.2,
                borderWidth: 2
            },
            point: {
                radius: 1,
                hoverRadius: 1
            }
        }
    };

    navToAddAcount(): void {
        this._mainComponent.setPageById(4);
    }

    onToggle() {
        this.cdr.detectChanges();
    }

    @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

    constructor(private _actData: AcctData, private cdr: ChangeDetectorRef, private _mainComponent: MainComponent) {
        this.personalRecords$ = this._actData.personalActHistory$;
        applyTooltipTheme(this.accountHistoryChartOptions);
    }

    private _chartHandles: ChartHandle[] = [];
    
        ngAfterViewInit(): void {
            this.charts.forEach(chartDir => {
                const h = createChartHandle(chartDir);
                if (h) this._chartHandles.push(h);
            });
            this.charts.changes.subscribe(() => {
                this._detachAllHandlers();
                this.charts.forEach(cd => {
                    const h = createChartHandle(cd);
                    if (h) this._chartHandles.push(h);
                });
            });
        }
    
        ngOnDestroy(): void {
            this._detachAllHandlers();
        }
    
        private _detachAllHandlers() {
            this._chartHandles.forEach(h => {
                try { h.remove(); } catch {}
            });
            this._chartHandles = [];
        }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this._actData.getPersonalAccountHistory().then(res => {
        })
        .catch((err) => console.error(err));
    }
}