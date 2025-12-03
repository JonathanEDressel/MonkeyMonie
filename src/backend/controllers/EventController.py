from flask import Blueprint, jsonify, request
from Extensions import limiter
from datetime import datetime, timezone
from helper.Security import requires_token
from .ErrorController import log_error_to_db
import controllers.AuthDbContext as _authCtx
import controllers.EventDbContext as _eventCtx

evnt_bp = Blueprint("event", __name__)

@evnt_bp.route('/events', methods=['POST'])
@limiter.limit("20 per minute")
@requires_token
def get_all_events():
    try:
        authUser = _authCtx.get_current_user()
        
        if not authUser.is_site_admin():
            return jsonify({"result": "Unauthorized", "status": 401}), 401
        req = request.json
        dte = req.get('date', datetime.now(timezone.utc)).strip()
        res = _eventCtx.get_all_events(dte)
        return jsonify({"result": res, "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@evnt_bp.route('/login/add', methods=['POST'])
@limiter.limit("40 per minute")
@requires_token
def add_login_event():
    try:
        authUser = _authCtx.get_current_user()
        if not authUser.is_site_admin():
            return jsonify({"result": "Unauthorized", "status": 401}), 401
        req = request.json
        username = req.get('username', 'N/A').strip()
        
        _eventCtx.add_event(username, 'User Login', 'Login')
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400