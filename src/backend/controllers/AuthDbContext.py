from flask import jsonify, request
from datetime import datetime, timezone
from .ErrorController import log_error_to_db
from models.UserModel import data_to_model
import helper.Helper as DBHelper
import helper.Security as Security
import models.OTPTokenModel as OTPModel
import controllers.EventDbContext as _eventCtx
import jwt
import bcrypt
import os

SECRET_KEY=os.getenv("SECRET_KEY")
ALGO_TO_USE=os.getenv("ALGO_TO_USE", "HS256")

def get_user_token(username, uuid):
    token = Security.create_jwt(uuid, username)
    return token

def get_current_user():
    try:
        authorized_user = request.headers.get("Authorization")
        if not authorized_user:
            return None
        
        sql = "SELECT Id, Username, FirstName, LastName, ExpireDate, Email, PhoneNumber, CreatedDate, "\
            "ConfirmedEmail, TwoFactor, LastLogin, IsDemo, AdminLevel, IsActive, IsAdmin FROM UserAcct WHERE Username = %s or Email = %s"
        token = authorized_user.split(" ")[1]
        decoded_token = jwt.decode(token, SECRET_KEY, ALGO_TO_USE)
        username = str(decoded_token['username'])
        params = (username,username)
        usr = DBHelper.run_query(sql, params, True)
        res = data_to_model(usr[0])
        if res:
            return res
        return None
    except Exception as e:
        log_error_to_db(e)
        return None

def get_current_user_id():
    try:
        authorized_user = request.headers.get("Authorization")
        if not authorized_user:
            return None
        
        sql = "SELECT Id FROM UserAcct WHERE Username = %s or Email = %s"
        token = authorized_user.split(" ")[1]
        decoded_token = jwt.decode(token, SECRET_KEY, ALGO_TO_USE)
        username = str(decoded_token['username'])
        params = (username,username)
        usr = DBHelper.run_query(sql, params, True)
        res = int(str(usr[0]['Id']))
        if res:
            return res
        return -1
    except Exception as e:
        log_error_to_db(e)
        return None

def is_admin():
    try:
        auth_usr = get_current_user()
        if not auth_usr:
            return False
        return auth_usr.is_site_admin()
    except Exception as e:
        log_error_to_db(e)
        return False    

def has_admin():
    try:
        h = DBHelper.encrypt_password("password")
        currDte = datetime.now(timezone.utc)
        res = DBHelper.run_query("SELECT Username FROM UserAcct Where Username = %s or Email = %s", 
                                ("Admin", "jonathanedressel@gmail.com"), 
                                True)
        if not res:
            adm_uuid = DBHelper.create_uuid()
            sql = """
            INSERT INTO UserAcct
            (Username, UserPassword, UUID, FirstName, LastName, Email, CreatedDate,
            ConfirmedEmail, TwoFactor, AdminLevel, IsAdmin, IsDemo, IsActive)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = ("Admin", h, adm_uuid, "Jonathan", "Dressel", "jonathanedressel@gmail.com", currDte,
                    1, 0, "Site", 1, 0, 1)
            DBHelper.run_query(sql, params)
    except Exception as e:
        log_error_to_db(e)

def user_login(username, password):
    try:
        sql = f"SELECT UserPassword, Username, UUID, IsActive, ExpireDate FROM UserAcct WHERE Username=%s or Email=%s"
        vars = (username, username)
        jsusr = DBHelper.run_query(sql, vars, True)
        usr = jsusr[0]
        usrexpdte = usr['ExpireDate']
        if (not usr):
            return jsonify({"result": "Invalid login credentials", "status": 400}), 400
        if (usr['IsActive'] == 0):
            return jsonify({"result": "Account is no longer active", "status": 400}), 400
        if (usrexpdte and usrexpdte < datetime.now()):
            return jsonify({"result": "Account has expired", "status": 400}), 400

        usrPWHash = usr['UserPassword']
        if isinstance(usrPWHash, str):
            usrPWHash = usrPWHash.encode('utf-8')
        token = get_user_token(usr['Username'], usr['UUID'])
        if (DBHelper.check_passwords(password, usrPWHash)) and (token is not None):
            currDte = str(datetime.now(timezone.utc))
            updatedLogin = DBHelper.update_value("UserAcct", "LastLogin", currDte, "Username", username)
            if not updatedLogin:
                DBHelper.update_value("UserAcct", "LastLogin", currDte, "Email", username)
            _eventCtx.add_event(username, 'User Login', 'Login')
            return jsonify({"token": token}), 200
        return jsonify({"result": "Invalid login credentials", "status": 409}), 409
        
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
def create_account(fname, lname, username, phonenumber, password):
    try:
        sql = f"SELECT UserPassword FROM UserAcct WHERE Username=%s or Email=%s"
        vars = (username, username)
        usr = DBHelper.run_query(sql, vars, True)
        if usr:
            return jsonify({"result": "Failed to create user account", "status": 409}), 409

        adm_uuid = DBHelper.create_uuid()
        hashedPassword = DBHelper.encrypt_password(password)
        sql = f"INSERT INTO UserAcct (Username, Email, FirstName, LastName, UserPassword, UUID, PhoneNumber, CreatedDate, IsActive) " \
            "VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s);"
        vars = (username, username, fname, lname, hashedPassword, adm_uuid, phonenumber, datetime.now(timezone.utc), 1)
        res = DBHelper.run_query(sql, vars, fetch=False)
        token = get_user_token(username, adm_uuid)
        if not res or not token:
            return jsonify({"result": "Failed to create user account", "status": 400}), 400
        return jsonify({"token": token}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
# def create_new_otp(id, hash):
#     try:
#         sql = f"INSERT INTO OTPTokens (UserId, TokenHash, ExpireTime, HasVerified) " \
#             "Values(%s, %s, %s, %s);"
#         vars = (id, hash, datetime.now(timezone.utc), False)
#         res = DBHelper.run_query(sql, vars, fetch=False)
#         return res
#     except Exception as e:
#         log_error_to_db(e)
#         return jsonify({"result": e, "status": 400}), 400

def valid_otp(otp, username):
    try:
        sql = f"SELECT Email, Username FROM UserAcct WHERE Username = %s Or Email = %s"
        params = (username, username)
        jsonusr = DBHelper.run_query(sql, params, fetch=True)
        if not jsonusr:
            return False
        usr = data_to_model(jsonusr[0])
        sql = f"SELECT Id, Username, TokenHash, ExpireTime FROM OTPTokens WHERE (Username = %s or Username = %s) and HasUsed = 0"
        params = (usr.Email, usr.Username)
        res = DBHelper.run_query(sql, params, fetch=True)
        if not res or len(res) == 0:
            return False
        for row in res:
            token_row = OTPModel.data_to_model(row)
            stored_hash_bytes = token_row.TokenHash.encode("utf-8")
            if DBHelper.check_otp_tokens(otp, stored_hash_bytes):
                expire_time = token_row.ExpireTime
                if expire_time.tzinfo is None:
                    expire_time = expire_time.replace(tzinfo=timezone.utc)
                if expire_time > datetime.now(timezone.utc):
                    DBHelper.update_value("OtpTokens", "HasUsed", 1, "Id", token_row.Id)
                    currDte = str(datetime.now(timezone.utc))
                    updatedLogin = DBHelper.update_value("UserAcct", "LastLogin", currDte, "Username", username)
                    if not updatedLogin:
                        DBHelper.update_value("UserAcct", "LastLogin", currDte, "Email", username)
                    return True
                else:
                    print("OTP found but expired")
        return False
    except Exception as e:
        log_error_to_db(e)
        return False
    
def get_token_data(username):
    try:
        sql = f"SELECT UserPassword, Username, UUID, IsActive, ExpireDate FROM UserAcct WHERE Username=%s or Email=%s"
        vars = (username, username)
        jsusr = DBHelper.run_query(sql, vars, True)
        usr = jsusr[0]
        token = get_user_token(usr['Username'], usr['UUID'])
        if token is not None:
            return jsonify({"token": token}), 200
        return jsonify({"token": None}), 400
    except Exception as e:
        log_error_to_db(e)
        return None