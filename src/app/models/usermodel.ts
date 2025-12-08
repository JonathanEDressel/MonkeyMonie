export class UserModel {
    Id = <number>(0);
    Username = <string>("");
    FirstName = <string>("");
    LastName = <string>("");
    Email = <string>("");
    PhoneNumber = <string>("");
    LastLogin = <string>("");
    CreatedDate = <string>("");
    IsDemo = <boolean>(false);
    IsAdmin = <boolean>(false);
    ExpireDate = <string>("");
    IsActive = <boolean>(false);
    AdminLevel = <string>("");
    ConfirmedEmail = <boolean>(false);
    TwoFactor = <boolean>(false);

    constructor() {
        this.Id = 0;
        this.Username = "";
        this.FirstName = "";
        this.LastName = "";
        this.Email = "";
        this.PhoneNumber = "";
        this.LastLogin = "";
        this.CreatedDate = "";
        this.IsDemo = false;
        this.IsAdmin = false;
        this.ExpireDate = "";
        this.IsActive = false;
        this.AdminLevel = "";
        this.ConfirmedEmail = false;
        this.TwoFactor = false;
    }

    getFullName(): string {
        return this.FirstName + " " + this.LastName;
    }

    accountType(): string {
        if (this.IsDemo)
            return "Demo";
        else if (this.AdminLevel?.toLowerCase() === "site")
            return "Site Admin";
        return "";
    }

    hasExpired(): boolean {
        if(!this.ExpireDate || this.ExpireDate.length === 0)
            return false;
        var expdte = new Date(this.ExpireDate);
        var now = new Date();
        return expdte < now;
    }

    assignData(data: UserModel): void {
        this.Id = data.Id;
        this.Username = data.Username;
        this.FirstName = data.FirstName;
        this.LastName = data.LastName;
        this.Email = data.Email;
        this.PhoneNumber = data.PhoneNumber;
        this.LastLogin = (new Date(data.LastLogin)).toLocaleDateString();
        this.CreatedDate = (new Date(data.CreatedDate)).toLocaleDateString();
        this.IsDemo = data.IsDemo;
        this.IsAdmin = data.IsAdmin;
        this.ExpireDate = (data.ExpireDate ? new Date(data.ExpireDate).toLocaleDateString() : "");
        this.IsActive = data.IsActive;
        this.AdminLevel = data.AdminLevel;
        this.ConfirmedEmail = data.ConfirmedEmail;
        this.TwoFactor = data.TwoFactor;
    }

    getData() {
        return {
            Id: this.Id,
            Username: this.Username,
            FirstName: this.FirstName,
            LastName: this.LastName,
            Email: this.Email,
            PhoneNumber: this.PhoneNumber,
            LastLogin: this.LastLogin,
            CreatedDate: this.CreatedDate,
            IsDemo: this.IsDemo,
            IsAdmin: this.IsAdmin,
            ExpireDate: this.ExpireDate,
            IsActive: this.IsActive,
            AdminLevel: this.AdminLevel,
            ConfirmedEmail: this.ConfirmedEmail,
            TwoFactor: this.TwoFactor,
        };
    }
}
