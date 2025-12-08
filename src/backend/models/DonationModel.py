from dataclasses import dataclass
from datetime import datetime

@dataclass
class DonationModel:
    Id: int
    Username: slice
    Amount: slice
    Notes: slice
    Method: slice
    DateAdded: datetime
    
def data_to_model(data):
    if not data:
        return None
    return DonationModel(
        Id=data.get('Id'),
        Username=data.get('Username'),
        Amount=data.get('Amount'),
        Notes=data.get('Notes'),
        Method=data.get('Method'),
        DateAdded=data.get('DateAdded')
    )
