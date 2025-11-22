from dataclasses import dataclass
from datetime import datetime

@dataclass
class User:
    Id: int
    Username: slice #Optional[str]
    FirstName: slice
    LastName: slice
    Email: slice
    PhoneNumber: slice
    CreatedDate: datetime
    ConfirmedEmail: bool
    TwoFactor: bool
    LastLogin: datetime
    IsDemo: bool
    AdminLevel: slice
    IsAdmin: bool

    def is_site_admin(self) -> bool:
        return self.IsAdmin and str(self.AdminLevel).casefold() == "site"
    
    def is_demo(self) -> bool:
        return self.IsDemo
    
    def full_name(self) -> str:
        return self.FirstName + " " + self.LastName

def data_to_model(data):
    if not data:
        return None
    return User(
        Id=data.get('Id'),
        Username=data.get('Username'),
        FirstName=data.get('FirstName'),
        LastName=data.get('LastName'),
        Email=data.get('Email'),
        PhoneNumber=data.get('PhoneNumber'),
        CreatedDate=data.get('CreatedDate'),
        ConfirmedEmail=bool(data.get('ConfirmedEmail')),
        TwoFactor=bool(data.get('TwoFactor')),
        LastLogin=data.get('LastLogin'),
        IsDemo=bool(data.get('IsDemo')),
        AdminLevel=data.get('AdminLevel'),
        IsAdmin=bool(data.get('IsAdmin'))
    )
