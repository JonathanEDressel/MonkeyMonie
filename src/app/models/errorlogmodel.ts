export class ErrorLogModel {
    Id = <number>(0);
    EventTimeStamp = <string>("");
    StackTrace = <string>("");
    Detail = <string>("");
    Username = <string>("");

    constructor(init?: Partial<ErrorLogModel>) {
        Object.assign(this, init);
    }

    assignData(data: ErrorLogModel) {
        this.Id = data.Id;
        this.EventTimeStamp = data.EventTimeStamp;
        this.StackTrace = data.StackTrace;
        this.Detail = data.Detail;
        this.Username = data.Username;
    }

    getData() {
        return {
            Id: this.Id,
            EventTimeStamp: this.EventTimeStamp,
            StackTrace: this.StackTrace,
            Detail: this.Detail,
            Username: this.Username
        };
    }
}
