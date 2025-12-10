from dataclasses import dataclass
from datetime import datetime

@dataclass
class PersonalRecordModel:
    Id: int
    AccountId: int
    UserId: int
    Balance: float
    Name: slice
    RecordedDate: datetime
    
def data_to_model(data):
    if not data:
        return None
    return PersonalRecordModel(
        Id=data.get('Id'),
        AccountId=data.get('AccountId'),
        UserId=data.get('UserId'),
        Balance=data.get('Balance'),
        Name=data.get('Name'),
        RecordedDate=convert_datetime(data.get('RecordedDate'))
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
