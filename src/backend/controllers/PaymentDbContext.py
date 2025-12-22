from flask import jsonify
from helper.ErrorHandler import log_error_to_db
import helper.Helper as DBHelper
import models.DonationModel as DonationModel
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
        
def get_all_donations():
    try:
        sql = f"SELECT * FROM DonationHistory;"
        res = DBHelper.run_query(sql, None, True)
        return res
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
def get_donations():
    try:
        authusr = _authDbCtx.get_current_user()
        sql = f"SELECT * FROM DonationHistory WHERE Username = %s;"
        params = (authusr.Username,)
        donations = DBHelper.run_query(sql, params, True)
        
        res = []
        for d in donations:
            tmp = DonationModel.data_to_model(d)
            res.append(tmp)
        return jsonify({"result": res, "status": 200}), 200
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