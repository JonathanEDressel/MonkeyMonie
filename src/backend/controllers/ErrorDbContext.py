from helper.ErrorHandler import log_error_to_db
import helper.Helper as DBHelper
import models.ErrorLogModel as ErrorLog

def get_errors_by_date(day, month, year):
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
        log_error_to_db(e)
        return None
