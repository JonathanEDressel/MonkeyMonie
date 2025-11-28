from dataclasses import dataclass
from datetime import datetime

@dataclass
class OTPToken:
    Id: int
    Username: slice
    TokenHash: slice
    HasUsed: bool
    ExpireTime: datetime
    
def data_to_model(data):
    if not data:
        return None
    return OTPToken(
        Id=data.get('Id'),
        Username=data.get('Username'),
        TokenHash=data.get('TokenHash'),
        HasUsed=bool(data.get('HasUsed')),
        ExpireTime=data.get('ExpireTime')
    )
