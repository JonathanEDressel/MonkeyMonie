from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class EventModel:
    Id: Optional[int] = None
    EventTimeStamp: Optional[datetime] = None
    EventText: Optional[str] = None
    Source: Optional[str] = None
    EventType: Optional[str] = None
    EventUser: Optional[str] = None
    
def data_to_model(data):
    if not data:
        return None
    return EventModel(
        Id=data.get('AccountId'),
        EventTimeStamp=convert_datetime(data.get('EventTimeStamp')),
        EventText=data.get('EventText'),
        Source=data.get('Source'),
        EventType=data.get('EventType'),
        EventUser=data.get('EventUser'),
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