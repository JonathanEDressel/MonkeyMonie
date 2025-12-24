from .ErrorDbContext import get_errors_by_date
from helper.ErrorHandler import log_error_to_db
from flask import Blueprint, jsonify, request, g
from helper.Security import requires_token
from Extensions import limiter
import controllers.AuthDbContext as _authCtx

error_bp = Blueprint("errors", __name__)

@error_bp.route('/logs', methods=['POST'])
@limiter.limit("20 per minute")
@requires_token
def get_error_log():
    try:
        usr = _authCtx.get_current_user()
        if not usr.is_site_admin():
            return jsonify({"result": None, "status": 401}), 401
        req = request.json
        day = req.get('day', 1)
        month = req.get('month', 6)
        year = req.get('year', 2025)
        res = get_errors_by_date(day, month, year)
        if res is None:
            return jsonify({"result": [], "status": 200}), 200
        return jsonify({"result": res, "status": 200}), 200
        
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400