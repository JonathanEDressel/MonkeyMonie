import traceback
from datetime import datetime
import helper.Helper as DBHelper
import models.ErrorLogModel as ErrorLog

def get_all_errors(day, month, year):
    try:
        sql = f"Select * From ErrorLog Where Day(EventTimeStamp) = %s And Month(EventTimeStamp) = %s And Year(EventTimeStamp) = %s;"
        params = (day, month, year)
        errors = DBHelper.run_query(sql, params, fetch=True)
        res = []
        for e in errors:
            tmp = ErrorLog.data_to_model(e)
            res.append(tmp)
        return res
    except Exception as e:
        log_error(e)
        return None

def log_error(exc: Exception, username = "n/a"):
    try:
        message = str(exc)
        stack = traceback.format_exc()
        stack = stack[:250]
        message = message[:250]
        sql = "INSERT INTO ErrorLog (Detail, StackTrace, EventTimeStamp, Username) "\
            "VALUES (%s, %s, %s, %s);"
        params = (message, stack, datetime.utcnow(), username)

        DBHelper.run_query(sql, params, fetch=False)
    except Exception as e:
        print("ERROR WHILE LOGGING ERROR:", e)
        print("Original error:", exc)