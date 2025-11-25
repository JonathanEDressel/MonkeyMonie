import traceback
from datetime import datetime
import helper.Helper as DBHelper

def log_error(exc: Exception, username = "n/a"):
    try:
        message = str(exc)
        stack = traceback.format_exc()

        sql = "INSERT INTO ErrorLog (Detail, StackTrace, EventTimeStamp, Username) "\
            "VALUES (%s, %s, %s, %s);"
        params = (message, stack, datetime.utcnow(), username)

        DBHelper.run_query(sql, params, fetch=False)
    except Exception as e:
        print("ERROR WHILE LOGGING ERROR:", e)
        print("Original error:", exc)