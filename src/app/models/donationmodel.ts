export class DonationModel {
    Id = <number>(0);
    Username = <string>("");
    Amount = <string>("");
    Notes = <string>("");
    Method = <string>("");
    DateAdded = <string>("");

    constructor(init?: Partial<DonationModel>) {
        Object.assign(this, init);
    }

    assignData(data: DonationModel) {
        this.Id = data.Id;
        this.Username = data.Username;
        this.Amount = data.Amount;
        this.Notes = data.Notes;
        this.Method = data.Method;
        this.DateAdded = data.DateAdded;
    }

    getData() {
        return {
            Id: this.Id,
            Username: this.Username,
            Amount: this.Amount,
            Notes: this.Notes,
            Method: this.Method,
            DateAdded: this.DateAdded
        };
    }
}
