from email.mimie.text import MIMEText
from flask import jsonify
import EmailDbContext as _emailDbCtx
from helper.ErrorHandler import log_error_to_db

def send_usr_email(toAddress, fromAddress, subject, body):
    try:
        return _emailDbCtx.send_usr_email(toAddress, fromAddress, subject, body)
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400
    
def send_admin_email(subject, body):
    try:
        return _emailDbCtx.send_admin_email(subject, body)
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400