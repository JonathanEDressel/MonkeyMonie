from models.EventModel import data_to_model, EventModel
from helper.ErrorHandler import log_error_to_db
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
        # Check for IP from proxies first (X-Forwarded-For, X-Real-IP)
        if request.headers.get('X-Forwarded-For'):
            # X-Forwarded-For can contain multiple IPs, get the first one (client IP)
            source = request.headers.get('X-Forwarded-For').split(',')[0].strip()
        elif request.headers.get('X-Real-IP'):
            source = request.headers.get('X-Real-IP')
        elif request.headers.get('CF-Connecting-IP'):
            # Cloudflare IP
            source = request.headers.get('CF-Connecting-IP')
        else:
            # Fall back to remote_addr if no proxy headers
            source = request.remote_addr
        
        dte = datetime.now(timezone.utc)
        sql = f"INSERT INTO EventLog (EventTimeStamp, EventText, Source, EventType, EventUser) " \
            "VALUES (%s, %s, %s, %s, %s)"
        params = (dte, eventText, source, eventType, username)
        
        return DBHelper.run_query(sql, params, False)
    except Exception as e:
        log_error_to_db(e)