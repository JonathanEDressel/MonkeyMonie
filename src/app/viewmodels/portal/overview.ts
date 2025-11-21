import { Component } from '@angular/core';
import { AcctData } from '../../services/acctdata';
import { PersonalAccountModel } from '../../models/personalaccountmodel';
import { Observable } from 'rxjs';
import { AgChartOptions } from 'ag-charts-community';
import { CommonModule } from '@angular/common';
import { AgChartsModule } from 'ag-charts-angular';

@Component({
  selector: 'overview-root',
  standalone: true,
  imports: [CommonModule, AgChartsModule],
  templateUrl: '../../views/portal/overview.html',
  styleUrl: '../../styles/portal/overview.scss'
})

export class OverviewComponent {

    personalAccts$: Observable<PersonalAccountModel[]>;
    individualAccounts: AgChartOptions[] = [];

    netWorthChartOptions: AgChartOptions = {
        data: [],
        series: [
            {
                type: "donut",
                calloutLabelKey: 'name',
                angleKey: 'value',
                innerRadiusRatio: 0.6,
                sectorLabelKey: 'value',
                sectorLabel: {
                    formatter: params => 
                        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(params.datum.value)
                },
                innerLabels: [
                    {
                        text: 'Net Worth',
                        fontSize: 14,
                        fontWeight: 'bold',
                    }
                ]
            },
        ],
        title: {
            text: 'Net Worth',
            fontSize: 44
        },
        legend: {
            position: 'bottom'
        }
    };

    populateNetWorthData(): void {
        this.personalAccts$.subscribe(accts => {
            if (!accts || accts.length === 0)
                return;

            const formatted = accts.map(act => ({
                name: act.Name,
                value: act.Balance
            }));

            const total = formatted.reduce((sum, x) => sum + x.value, 0);

            this.netWorthChartOptions = {
                ...this.netWorthChartOptions,
                data: formatted,
                subtitle: {
                    fontSize: 24,
                    fontWeight: 'bold',
                    text: `Total ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}`
                }
            }
        });
    }

    //Need to get data for history
    // populateSingleAccounts(): void {
    //     this.personalAccts$.subscribe(accts => {
    //         if(!accts || accts.length === 0)
    //             return;

    //         this.individualAccounts = accts.map(a => {
    //             const data = a.Balance;
    //         })
    //     })
    // }

    constructor(private _acctData: AcctData) {
        this.personalAccts$ = _acctData.personalAccounts$;
    }

    ngOnInit(): void {
        this.activate();
        this._acctData.getPersonalAccounts();
        this.populateNetWorthData();
    }

    activate(): void {
    }
};
