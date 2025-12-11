export class PersonalAccountHistoryModel {
    Id = <number>(0);
    AccountId = <number>(0);
    Balance = <number>(0.00);
    RecordedDate = <string>("");

    constructor(init?: Partial<PersonalAccountHistoryModel>) {
        Object.assign(this, init);
    }

    assignData(data: PersonalAccountHistoryModel) {
        this.Id = data.Id;
        this.AccountId = data.AccountId;
        this.Balance = data.Balance;
        this.RecordedDate = data.RecordedDate;
    }

    getData() {
        return {
            Id: this.Id,
            AccountId: this.AccountId,
            Balance: this.Balance,
            RecordedDate: this.RecordedDate
        };
    }
}
