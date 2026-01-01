from flask import g
from datetime import datetime
import traceback
import helper.Helper as DBHelper

def log_error_to_db(exc: Exception):
    try:
        if (not g) or (not g.current_user) or (len(g.current_user.Username) == 0):
            log_error(exc, "n/a")
        else:
            log_error(exc, g.current_user.Username)
    except Exception as e:
        print("ERROR WHILE LOGGING ERROR:", e)
        print("Original error:", exc)
        log_error(e)
        
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