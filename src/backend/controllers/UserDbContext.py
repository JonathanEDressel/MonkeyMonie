from flask import jsonify
import helper.Helper as DBHelper
import controllers.AuthDbContext as _authDbCtx

def get_users():
    try:
        if not _authDbCtx.is_admin():        
            return jsonify({"result": "Unauthorized", "status": 401}), 401
        sql = "SELECT Username, FirstName, LastName, Email, PhoneNumber, CreatedDate, LastLogin FROM UserAcct;"
        usrs = DBHelper.run_query(sql, None, fetch=True)
        return jsonify({"result": usrs, "status": 200}), 200
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400
    
def get_current_user():
    try:
        usr = _authDbCtx.get_current_user()
        if not usr:        
            return jsonify({"result": None, "status": 401}), 401
        return jsonify({"result": usr, "status": 200}), 200
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400