from flask import Blueprint, jsonify, request
from Extensions import limiter
from helper.Security import requires_token
from helper.ErrorHandler import log_error_to_db
import controllers.UserDbContext as _usrCtx
from models.UserModel import data_to_model, User

usr_bp = Blueprint("user", __name__)

# add internal user authentication
    # check if they are site admin
    # eventually do this in segments (1000 users at a time)
@usr_bp.route('/users', methods=['GET'])
@limiter.limit("40 per minute")
@requires_token
def get_users():
    try:
        return _usrCtx.get_users()
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@usr_bp.route('/user', methods=['GET'])
@limiter.limit("40 per minute")
@requires_token
def get_user():
    try:
        return _usrCtx.get_current_user()
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@usr_bp.route('/updatePassword', methods=['POST'])
@limiter.limit("15 per minute")
@requires_token
def update_password():
    try:
        req = request.json
        newPassword = req.get('newpassword', '').strip()
        _usrCtx.update_password(newPassword)
        return jsonify({"result": "Successfully updated password", "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@usr_bp.route('/updateUserPassword', methods=['POST'])
@limiter.limit("15 per minute")
@requires_token
def update_user_password():
    try:
        req = request.json
        newPassword = req.get('newpassword', '').strip()
        userid = int(req.get('userid', 0))
        _usrCtx.update_user_password(userid, newPassword)
        return jsonify({"result": "Successfully updated password", "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@usr_bp.route('/update', methods=['POST'])
@limiter.limit("15 per minute")
@requires_token
def update_user():
    try:
        req = request.json
        usr = data_to_model(req.get('user', User))
        _usrCtx.update_user(usr)
        return jsonify({"result": "Successfully updated user", "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400