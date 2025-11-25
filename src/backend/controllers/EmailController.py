from email.mimie.text import MIMEText
from flask import jsonify
import EmailDbContext as _emailDbCtx
from .ErrorController import log_error_to_db
import smtplib

def send_usr_email(toAddress, fromAddress, subject, body):
    try:
        print("Sending OTP")
        return _emailDbCtx.send_usr_email(toAddress, fromAddress, subject, body)
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400