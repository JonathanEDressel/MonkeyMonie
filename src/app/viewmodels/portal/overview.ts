import { Component } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { PersonalAccountModel } from '../../models/personalaccountmodel';
import { Observable } from 'rxjs';
import { AgChartOptions, AgPieSeriesOptions  } from 'ag-charts-community';
import { CommonModule } from '@angular/common';
import { AgChartsModule } from 'ag-charts-angular';
import { MainComponent } from '../main';
import { InfoPanelComponent } from "../shared/info.component";
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'overview-root',
  standalone: true,
  imports: [CommonModule, AgChartsModule, InfoPanelComponent, BaseChartDirective],
  templateUrl: '../../views/portal/overview.html',
  styleUrl: '../../styles/portal/overview.scss'
})

export class OverviewComponent {
    personalRecords$: Observable<PersonalAccountModel[]>;

    personalAccts$: Observable<PersonalAccountModel[]>;
    individualAccounts: AgChartOptions[] = [];

    accountHistoryChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        var val = context?.parsed?.y ?? '';
                        return `$${val.toLocaleString()}`; 
                    }
                }
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
                        maxTicksLimit: 6
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
                radius: 3,
                hoverRadius: 5
            }
        }
    };

    netWorthChartOptions: AgChartOptions = {
        data: [],
        series: [
            {
                type: "pie",
                angleKey: 'value',
                calloutLabelKey: 'name',
                innerRadiusRatio: 0.6,
                sectorLabelKey: 'value',
                strokeWidth: 2,
                stroke: '#fff',
                sectorLabel: {
                    formatter: params => this.formatCurrency(params.datum.value),
                    fontSize: 14,
                    color: '#333',
                },
                
                tooltip: {
                    enabled: true,
                    renderer: (params: any) => {
                        return `<div class="ag-chart-tooltip-content">${params.datum.name}: ${this.formatCurrency(params.datum.value, 0)}</div>`;
                    }
                } as any
            } as AgPieSeriesOptions
        ],
        tooltip: {
            enabled: true,
        },
        title: {
            text: 'Net Worth',
            fontSize: 28,
            fontWeight: 'bold',
            color: '#222',
        },
        legend: {
            enabled: false,
            position: 'top',
            spacing: 10,
            item: {
                label: { fontStyle: 'normal', fontWeight: 'normal' },
                marker: { size: 14 }
            }
        }
    };

    navToAddAcount(): void {
        this._mainComponent.setPageById(4);
    }

    populateNetWorthData(): void {
        this.personalAccts$.subscribe(accts => {
            if (!accts || accts.length === 0)
                return;

            const formatedActs = accts.map(act => ({
                name: act.Name,
                value: act.Balance
            }));

            const total = formatedActs.reduce((sum, x) => sum + x.value, 0);

            this.netWorthChartOptions = {
                ...this.netWorthChartOptions,
                data: formatedActs,
                subtitle: {
                    fontSize: 24,
                    fontWeight: 'bold',
                    text: `Total ${this.formatCurrency(total)}`
                }
            }
        });
    }

    formatCurrency(val: number,dec: number = 0): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: dec}).format(val);
    }

    constructor(private _acctData: AcctData, private _mainComponent: MainComponent) {
        this.personalAccts$ = _acctData.personalAccounts$;
        this.personalRecords$ = _acctData.personalActHistory$;
    }

    ngOnInit(): void {
        this.activate();
        this._acctData.getPersonalAccounts().then(() => {
            this.populateNetWorthData();
        });
        this._acctData.getPersonalAccountHistory();
    }

    activate(): void {
    }
};
