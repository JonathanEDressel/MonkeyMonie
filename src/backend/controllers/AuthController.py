from flask import Blueprint, jsonify, request, g
from helper.Security import requires_token
from Extensions import limiter
import controllers.AuthDbContext as _authCtx
import controllers.EmailDbContext as _emailCtx
import helper.Helper as DBHelper
import helper.Security as Security
from .ErrorController import log_error_to_db
from models.UserModel import data_to_model

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("20 per minute")
def user_login():
    try:
        req = request.json
        username = req.get('username', '').strip()
        password = req.get('userpassword', '').strip()
        return _authCtx.user_login(username, password)
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@auth_bp.route('/signup',methods=['POST'])
@limiter.limit("5 per minute")
def create_account():
    try:
        req = request.json
        fname = req.get('firstname', '').strip()
        lname = req.get('lastname', '').strip()
        username = req.get('email', '').strip()
        phonenumber = req.get('phonenumber', '').strip()
        password = req.get('userpassword', '').strip()
        if not username or not password:
            return jsonify({"result": "Please enter a valid username and password", "status": 400}), 400
        return _authCtx.create_account(fname, lname, username, phonenumber, password)
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@auth_bp.route("/forgotPassword", methods=['POST'])
@limiter.limit("10 per minute") #revert back after testing
def forgot_password():
    try:
        req = request.json
        useremail = str(req.get('email', '').strip())
        if not useremail:
            return jsonify({"result": "Email successfully sent!", "status": 200}), 200 
        
        params = (useremail, useremail)
        jsonusr = DBHelper.run_query("SELECT Id, Username, Email FROM UserAcct Where Username = %s or Email = %s", params, True)
        usr = data_to_model(jsonusr[0])
        if not usr:
            return jsonify({"result": "Email successfully sent!", "status": 200}), 200
        
        otp = Security.generate_otp(6)
        _emailCtx.send_usr_email(usr.Email, "Two FA Passcode", f"Your one-time passcode: {otp}")
        Security.add_otp_token(otp, usr.Username)
        return jsonify({"result": "Email successfully sent!", "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400

@auth_bp.route('/verifyToken', methods=['POST'])
@limiter.limit("5 per minute")
def verify_token():
    try:
        req = request.json
        username = str(req.get('username', '')).strip()
        otp = str(req.get('otptoken', '')).strip()
        if _authCtx.valid_otp(otp, username):
            return _authCtx.get_token_data(username)
        return jsonify({"result": "Could not verify token", "status": 400}), 400
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
   
@auth_bp.route('/isAdmin', methods=['GET'])
@limiter.limit("100 per minute")
@requires_token
def is_admin():
    try:
        res = _authCtx.is_admin()
        return jsonify({"result": res, "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400