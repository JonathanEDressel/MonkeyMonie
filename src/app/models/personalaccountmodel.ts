class RecordModel {
    Balance = <number>(0);
    Date = <Date>(new Date);
}

export class PersonalAccountModel {
    Id = <number>(0);
    Name = <string>("");
    Balance = <number>(0);
    Type = <string>("");
    DateAdded = <Date>(new Date);
    Records = <RecordModel[]>([]);

    constructor() {
        this.Id = 0;
        this.Name = "";
        this.Balance = 0;
        this.Type = "";
        this.DateAdded = new Date;
        this.Records.length = 0;
    }

    assignData(data: PersonalAccountModel) {
        this.Id = data.Id
        this.Name = data.Name;
        this.Balance = data.Balance;
        this.Type = data.Type;
        this.DateAdded = data.DateAdded;
        this.Records = data.Records;
    }

    getData() {
        return {
            Id: this.Id,
            Name: this.Name,
            Balance: this.Balance,
            Type: this.Type,
            DateAdded: this.DateAdded,
            Records: this.Records
        };
    }
}