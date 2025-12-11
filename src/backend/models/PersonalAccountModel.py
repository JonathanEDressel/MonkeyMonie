from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Any
from models.PersonalRecordModel import PersonalRecordModel

@dataclass
class PersonalAccount:
    Id: Optional[int] = None
    UserId: Optional[int] = None
    Name: Optional[str] = None
    Type: Optional[str] = None
    IsActive: Optional[bool] = True
    Balance: Optional[float] = None
    DateAdded: Optional[datetime] = None
    Records: List[PersonalRecordModel] = field(default_factory=list)
    
def data_to_model(data):
    if not data:
        return None
    
    record_list = [
        PersonalRecordModel(**record)
        for record in data.get("Records", [])
    ]
    
    return PersonalAccount(
        Id=data.get('Id'),
        UserId=data.get('UserId'),
        Name=data.get('Name'),
        Type=data.get('Type'),
        IsActive=data.get('IsActive'),
        Balance=data.get('Balance'),
        DateAdded=convert_datetime(data.get('CreatedDate')),
        Records=record_list
    )
    
def convert_datetime(val):
    if isinstance(val, datetime):
        return val
    if val is None:
        return None
    try:
        return datetime.fromisoformat(val)
    except Exception as e:
        print(f"ERROR: {e}")
        return None