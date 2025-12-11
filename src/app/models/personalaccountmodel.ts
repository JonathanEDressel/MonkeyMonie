import { PersonalAccountHistoryModel } from "./personalaccounthistorymodel";
import { ChartData, ChartOptions, ElementChartOptions } from 'chart.js';

export class PersonalAccountModel {
    Id = <number>(0); 
    Name = <string>(""); 
    Balance = <number>(0); 
    Type = <string>(""); 
    DateAdded = <Date>(new Date); 
    IsActive = <boolean>(true); 
    ChartRecords = <ChartData<'line'> | null>null;
    Records = <PersonalAccountHistoryModel[]>([]);

    constructor(init?: Partial<PersonalAccountModel>) {
        Object.assign(this, init);
    }

    assignData(data: PersonalAccountModel) {
        this.Id = data.Id
        this.Name = data.Name;
        this.Balance = data.Balance;
        this.Type = data.Type;
        this.DateAdded = data.DateAdded;
        this.IsActive = data.IsActive;
        this.Records = data.Records;
        this.ChartRecords = <ChartData<'line'>>{
        labels: data.Records.map(r => this.formatDate(r.RecordedDate)),
        datasets: [
            {
                label: this.Name + ' Balance',
                data: data.Records.map(r => r.Balance),
                fill: false,
                tension: 0.1
            }
        ]
        };
    }

    getData() {
        return {
            Id: this.Id,
            Name: this.Name,
            Balance: this.Balance,
            Type: this.Type,
            DateAdded: this.DateAdded,
            IsActive: this.IsActive,
            Records: this.Records
        };
    }

    private formatDate(date: string | Date): string {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${month}/${day}/${year}`;
    }
}