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
        authusr = _authDbCtx.get_current_user()
        if not authusr:        
            return jsonify({"result": "Unauthorized", "status": 401}), 401
        return jsonify({"result": authusr, "status": 200}), 200
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400
    
def update_password(newPassword):
    try:
        hashedPassword = DBHelper.encrypt_password(newPassword)
        authusr = _authDbCtx.get_current_user()
        if not authusr:
            return jsonify({"result": "Unauthorized", "status": 401}), 401
        sql = "UPDATE UserAcct SET UserPassword = %s WHERE Id = %s"
        params = (hashedPassword, authusr.Id)
        return DBHelper.run_query(sql, params, False)
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400
    
def update_user(user):
    try:
        print(f"Updating user {user.Username}")
        authusr = _authDbCtx.get_current_user()

        if not authusr:
            return jsonify({"result": "Unauthorized", "status": 401}), 401
            
        #make sure email, phone number, and username are not in use apart from current user

        fields_to_update = ["Username", "FirstName", "LastName", "Email", "PhoneNumber","TwoFactor"]
        if authusr.is_site_admin():
            fields_to_update.append("IsDemo")
            fields_to_update.append("IsAdmin")
            fields_to_update.append("ConfirmedEmail")
            fields_to_update.append("AdminLevel")
        set_clause = ", ".join([f"{field} = %s" for field in fields_to_update])

        sql = f"UPDATE UserAcct SET {set_clause} WHERE Id = %s"
        params = [getattr(user, field) for field in fields_to_update]
        params.append(user.Id)
        
        return DBHelper.run_query(sql, tuple(params), False)
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400