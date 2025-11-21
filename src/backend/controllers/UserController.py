from flask import Blueprint, jsonify, request
from Extensions import limiter
from helper.Security import requires_token
import controllers.UserDbContext as _usrCtx

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
        return jsonify({"result": e, "status": 400}), 400
    
@usr_bp.route('/user', methods=['GET'])
@limiter.limit("40 per minute")
@requires_token
def get_user():
    try:
        return _usrCtx.get_current_user()
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400
    
@usr_bp.route('/user/updatePassword', methods=['PATCH'])
@limiter.limit("15 per minute")
@requires_token
def update_password():
    try:
        req = request.json
        newPassword = req.get('newpassword', '').strip()
        return jsonify({"result": "Successfully updated password", "status": 200}), 200
    except Exception as e:
        return jsonify({"result": e, "status": 400}), 400