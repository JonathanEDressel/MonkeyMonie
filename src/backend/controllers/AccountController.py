from flask import Blueprint, jsonify, request, g
from helper.Security import requires_token
from Extensions import limiter
import controllers.AuthDbContext as _authCtx
import controllers.AccountDbContext as _actCtx
from .ErrorController import log_error_to_db

act_bp = Blueprint("act", __name__)

#Personal Accounts
@act_bp.route('/add/personal', methods=['POST'])
@limiter.limit("60 per minute")
@requires_token
def add_personal():
    try:
        req = request.json
        name = str(req.get('name', '').strip())
        type = str(req.get('type', '').strip())
        balance = float(req.get('balance', 0))
        
        usr = _authCtx.get_current_user()
        if (not usr) or (usr.Id) <= 0:
            return jsonify({"result": None, "status": 401}), 401
        
        userid = usr.Id
        act = _actCtx.add_personal_account(userid, name, type, balance)
        if act.Id <= 0:
            return jsonify({"result": f"Failed to add {name} account", "status": 400}), 400
        _actCtx.add_personal_record(act.Id, balance)
        return jsonify({"result": act, "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@act_bp.route('/update/personal/<int:AcctId>', methods=['POST'])
@limiter.limit("60 per minute")
@requires_token
def update_personal(AcctId):
    try:
        usr = _authCtx.get_current_user()
        if (not usr.Id) or (usr.Id) or (not _actCtx.personal_acct_is_users(AcctId, usr.Id)):
            return jsonify({"result": None, "status": 401}), 401
        
        req = request.json
        balance = float(req.get('balance', 0))
        name = str(req.get('name', '').strip())
        type = str(req.get('type', '').strip())
        _actCtx.update_personal_account(AcctId, name, type, balance)
        return jsonify({"result": AcctId, "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@act_bp.route('/remove/personal/<int:AcctId>', methods=['GET'])
@limiter.limit("60 per minute")
@requires_token
def remove_personal(AcctId):
    try:
        usr = _authCtx.get_current_user()
        if (not usr.Id) or (usr.Id) <= 0:
            return jsonify({"result": None, "status": 401}), 401
        if not _actCtx.personal_acct_is_users(AcctId, usr.Id):
            return jsonify({"result": None, "status": 401}), 401
        
        _actCtx.remove_personal_account(AcctId, usr.Id)
        return jsonify({"result": "account removed", "status": 200}), 200 
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
@act_bp.route('/personal', methods=['GET'])
@limiter.limit("60 per minute")
@requires_token
def get_personal_accounts():
    try:
        userid = _authCtx.get_current_user_id()
        if (not userid) or (userid) <= 0:
            return jsonify({"result": None, "status": 401}), 401
        acts = _actCtx.get_personal_accounts(userid)
        return jsonify({"result": acts, "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400

@act_bp.route('/personal/records', methods=['GET'])
@limiter.limit("60 per minute")
@requires_token
def get_personal_account_history():
    try:
        userid = _authCtx.get_current_user_id()
        if (not userid) or (userid) <= 0:
            return jsonify({"result": None, "status": 401}), 401
        acts = _actCtx.get_personal_history(userid)
        return jsonify({"result": acts, "status": 200}), 200
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
#User Assets
@act_bp.route('/house', methods=['GET'])
@limiter.limit("60 per minute")
@requires_token
def get_house_details():
    try:
        userid = _authCtx.get_current_user_id()
        if not userid or userid <= 0:
            return jsonify({"result": None, "status": 401}), 401
        req = request.json
        address = str(req.get('address', '').strip())
        if (not address) or len(address) <= 0:
            return jsonify({"result": "Provide a valid address", "status": 401}), 401
        return _actCtx.get_house_details(address)
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400