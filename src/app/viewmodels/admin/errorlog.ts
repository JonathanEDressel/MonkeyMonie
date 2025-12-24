import { FormsModule } from '@angular/forms';
import { Component , signal} from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AdminData } from '../../services/admindata';
import { ErrorLogModel } from '../../models/errorlogmodel';

@Component({
  selector: 'users-root',
  standalone: true,
  imports: [FormsModule, AsyncPipe, DatePipe],
  templateUrl: '../../views/admin/errorlog.html',
  styleUrl: '../../styles/admin/errorlog.scss'
})

export class ErrorLogComponent  {
    
    errorLogs$: Observable<ErrorLogModel[]>;
    _errorLogDate: string = new Date().toISOString().slice(0, 10);

    logDte!: Date;

    selectedError = signal(new ErrorLogModel);

    convertMonthStringToDate(monthYearString: string): Date {
        const fullDateString = `${monthYearString}-01T00:00:00`;
        return new Date(fullDateString);
    }

    set errorLogDate(val: string) {
        if(val !== this._errorLogDate) {
            this._errorLogDate = val;
            this.logDte = this.convertMonthStringToDate(val);
            this.onDateChange();
        }
    }

    get errorLogDate(): string {
        return this._errorLogDate;
    }

    clearSelectedError(): void {
        this.selectedError.set(new ErrorLogModel);
    }

    selectError(error: ErrorLogModel): void {
        console.log(error)  
        this.selectedError.set(error);
    }

    onDateChange() {
        const [year, month, day] = this._errorLogDate.split('-');
        this._adminData.getErrorLog(Number(day), Number(month), Number(year));
    }

    ngOnInit(): void {
        this.activate();
    }

    activate(): void {
        this.onDateChange();
    }

    constructor(private _adminData: AdminData) {
        this.errorLogs$ = _adminData.errorLogs$;
        // this.clearSelectedError();
    }
}