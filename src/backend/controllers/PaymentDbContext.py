from flask import jsonify
from .ErrorController import log_error_to_db
import helper.Helper as DBHelper
import models.UserModel as UserModel
import controllers.AuthDbContext as _authDbCtx

def add_donation(username, amount, method, notes, dte):
    try:
        sql = f"INSERT INTO DonationHistory (Username, Amount, Method, Notes, DateAdded) " \
            "VALUES (%s, %s, %s, %s, %s);"
        params = (username, amount, method, notes, dte)
        return DBHelper.run_query(sql, params, False)
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
        
def get_donations():
    try:
        sql = f"SELECT * FROM DonationHistory;"
        res = DBHelper.run_query(sql, None, True)
        return res
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
def get_donations_by_username(username):
    try:
        sql = f"SELECT * FROM DonationHistory WHERE Username = %s;"
        res = DBHelper.run_query(sql, (username,), True)
        return res
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400