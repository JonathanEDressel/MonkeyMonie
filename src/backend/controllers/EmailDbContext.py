from dotenv import load_dotenv
from flask import jsonify
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from postmarker.core import PostmarkClient
from .ErrorController import log_error_to_db
import os

load_dotenv()

POSTMARK_TOKEN=os.getenv("POSTMARK_TOKEN")
EMAIL_SENDER=os.getenv("EMAIL_SENDER")

def send_usr_email(toAddress, subject, body):
    try:
        client = PostmarkClient(server_token=POSTMARK_TOKEN)
        # res = client.emails.send(
        #     From=EMAIL_SENDER,
        #     To=toAddress,
        #     Subject=subject,
        #     TextBody=body
        # )
        return jsonify({"result": "Email successfully sent!", "status": 200}), 200
        
        # if hasattr(res, 'ErrorCode') and res['ErrorCode'] == 0:
        #     return jsonify({"result": "Email successfully sent!", "status": 200}), 200
        # elif isinstance(res, dict) and res.get('ErrorCode') == 0:
        #     return jsonify({"result": "Email successfully sent!", "status": 200}), 200
        # error_message = res.get('Message', 'Unknown error') if isinstance(res, dict) else str(res)
        # return jsonify({"result": error_message, "status": 400}), 400
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"result": e, "status": 400}), 400