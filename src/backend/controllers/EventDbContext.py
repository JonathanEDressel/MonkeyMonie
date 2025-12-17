from models.EventModel import data_to_model, EventModel
from .ErrorController import log_error_to_db
from datetime import datetime, timezone
from flask import Flask, request
import helper.Helper as DBHelper

def get_all_events(dte):
    try:
        sql = f"SELECT * FROM EventLog WHERE MONTH(EventTimeStamp) = %s " \
            "AND YEAR(EventTimeStamp) = %s ORDER BY EventTimeStamp Desc"
        params = (dte.month, dte.year)
        data = DBHelper.run_query(sql, params, True)
        res = []
        for d in data:
            tmp = data_to_model(d)
            res.append(tmp)
        return res
    except Exception as e:
        log_error_to_db(e)
        
def add_event(username, eventText, eventType):
    try:
        source = str(request.remote_addr)
        dte = datetime.now(timezone.utc)
        sql = f"INSERT INTO EventLog (EventTimeStamp, EventText, Source, EventType, EventUser) " \
            "VALUES (%s, %s, %s, %s, %s)"
        params = (dte, eventText, source, eventType, username)
        
        return DBHelper.run_query(sql, params, False)
    except Exception as e:
        log_error_to_db(e)