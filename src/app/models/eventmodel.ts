export class EventModel {
    Id = <number>(0);
    EventTimeStamp = <string>("");
    EventText = <string>("");
    Source = <string>("");
    EventType = <string>("");
    EventUser = <string>("");

    constructor(init?: Partial<EventModel>) {
        Object.assign(this, init);
    }

    assignData(data: EventModel) {
        this.Id = data.Id;
        this.EventTimeStamp = data.EventTimeStamp;
        this.EventText = data.EventText;
        this.Source = data.Source;
        this.EventType = data.EventType;
        this.EventUser = data.EventUser;
    }

    getData() {
        return {
            Id: this.Id,
            EventTimeStamp: this.EventTimeStamp,
            EventText: this.EventText,
            Source: this.Source,
            EventType: this.EventType,
            EventUser: this.EventUser
        };
    }
}
