from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class ErrorLogModel:
    Id: Optional[int] = None
    EventTimeStamp: Optional[datetime] = None
    StackTrace: Optional[str] = None
    Detail: Optional[str] = None
    Username: Optional[str] = None
    
def data_to_model(data):
    if not data:
        return None
    return ErrorLogModel(
        Id=data.get('Id'),
        EventTimeStamp=convert_datetime(data.get('EventTimeStamp')),
        StackTrace=data.get('StackTrace'),
        Detail=data.get('Detail'),
        Username=data.get('Username'),
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