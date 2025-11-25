from flask import jsonify
import helper.Helper as DBHelper
import models.UserModel as UserModel
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

def get_user_by_id(id):
    try:
        sql = "SELECT * FROM UserAcct WHERE Id = %s LIMIT 1;"
        params = (id,)
        usr = DBHelper.run_query(sql, params, fetch=True)
        res = UserModel.data_to_model(usr[0])

        if usr:        
            return res
        return None
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400
    
def get_user_by_username(username):
    try:
        sql = "SELECT * FROM UserAcct WHERE Username = %s LIMIT 1;"
        params = (username,)
        usr = DBHelper.run_query(sql, params, fetch=True)
        res = UserModel.data_to_model(usr[0])

        if res:        
            return res
        return None
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
            
        sql = f"SELECT Username, Email, PhoneNumber FROM UserAcct WHERE Id <> %s " \
            " AND (Lower(username) = LOWER (%s) " \
            "OR LOWER(EMAIL) = LOWER(%s) " \
            "OR LOWER(PhoneNumber) = LOWER(%s));"
        params = (user.Id,user.Username, user.Email, user.PhoneNumber)
        conflict = DBHelper.run_query(sql, params, fetch=True)
        
        conflicts = []
        if conflict:
            row = conflict[0]
            if row["username"].lower() == user.Username.lower():
                conflicts.append("Username")
            if row["email"].lower() == user.Email.lower():
                conflicts.append("Email")
            if row["phonenumber"].lower() == user.PhoneNumber.lower():
                conflicts.append("PhoneNumber")

        fields_to_update = ["Username", "FirstName", "LastName", "Email", "PhoneNumber","TwoFactor"]
        if authusr.is_site_admin():
            fields_to_update.append("IsDemo")
            fields_to_update.append("IsAdmin")
            fields_to_update.append("IsActive")
            fields_to_update.append("ExpireDate")
            fields_to_update.append("ConfirmedEmail")
            fields_to_update.append("AdminLevel")

        fields_to_update = [f for f in fields_to_update if f not in conflicts]
        if not fields_to_update:
            return jsonify({ "result": "No fields were updated because all conflict with other users.", "status": 409 }), 409
        set_clause = ", ".join([f"{field} = %s" for field in fields_to_update])

        sql = f"UPDATE UserAcct SET {set_clause} WHERE Id = %s"
        params = [getattr(user, field) for field in fields_to_update]
        params.append(user.Id)
        
        return DBHelper.run_query(sql, tuple(params), False)
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400