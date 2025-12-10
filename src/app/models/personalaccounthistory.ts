export class PersonalAccountHistoryModel {
    Id = <number>(0);
    AccountId = <number>(0);
    UserId = <number>(0);
    Balance = <number>(0.00);
    Name = <string>("");
    RecordedDate = <string>("");

    constructor() {
        this.Id = 0;
        this.AccountId = 0;
        this.UserId = 0;
        this.Balance = 0.00;
        this.Name = "";
        this.RecordedDate = "";
    }

    assignData(data: PersonalAccountHistoryModel) {
        this.Id = data.Id;
        this.AccountId = data.AccountId;
        this.UserId = data.UserId;
        this.Balance = data.Balance;
        this.Name = data.Name;
        this.RecordedDate = data.RecordedDate;
    }

    getData() {
        return {
            Id: this.Id,
            AccountId: this.AccountId,
            UserId: this.UserId,
            Balance: this.Balance,
            Name: this.Name,
            RecordedDate: this.RecordedDate
        };
    }
}
