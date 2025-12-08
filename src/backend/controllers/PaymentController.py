from flask import Blueprint, jsonify, request
from Extensions import limiter
from helper.Security import requires_token
from .ErrorController import log_error_to_db
from datetime import datetime, timezone
import controllers.AuthDbContext as _authDbCtx
import controllers.PaymentDbContext as _payDbCtx

pay_bp = Blueprint("payment", __name__)

@pay_bp.route('/donation/add', methods=['POST'])
@limiter.limit("15 per minute")
@requires_token
def add_donation():
    try:
        req = request.json
        method = str(req.get('method', 'n/a').strip())
        amount = str(req.get('amount', 'n/a').strip())
        notes = str(req.get('notes', '').strip())
        notes = notes[:250]
        authusr = _authDbCtx.get_current_user()
        if not authusr:
            return jsonify({"result": "Unauthorized", "status": 401}), 401
        _payDbCtx.add_donation(authusr.Username, amount, method, notes, str(datetime.now(timezone.utc)))
        return jsonify({"result": "Successfully added donation", "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400

@pay_bp.route('/donations/all', methods=['GET'])
@limiter.limit("40 per minute")
@requires_token
def get_all_donations():
    try:
        if not _authDbCtx.is_admin():
            return jsonify({"result": "Unauthorized", "status": 401}), 401
        return _payDbCtx.get_all_donations()
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@pay_bp.route('/donations', methods=['GET'])
@limiter.limit("40 per minute")
@requires_token
def get_donations():
    try:
        return _payDbCtx.get_donations()
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@pay_bp.route('/donation/user', methods=['GET'])
@limiter.limit("40 per minute")
@requires_token
def get_user_donations():
    try:
        if not _authDbCtx.is_admin():
            return jsonify({"result": "Unauthorized", "status": 401}), 401
        
        req = request.json
        username = str(req.get('username', '').strip())
        
        return _payDbCtx.get_donations_by_username(username)
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400