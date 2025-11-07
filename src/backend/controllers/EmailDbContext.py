from dotenv import load_dotenv
from flask import jsonify
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from postmarker.core import PostmarkClient
import smtplib
import os

load_dotenv()

POSTMARK_TOKEN=os.getenv("POSTMARK_TOKEN")
EMAIL_SENDER=os.getenv("EMAIL_SENDER")

def send_usr_email(toAddress, subject, body):
    try:
        client = PostmarkClient(server_token=POSTMARK_TOKEN)
        res = client.emails.send(
            From=EMAIL_SENDER,
            To="support@monkeymonie.com", #toAddress, #update this once Postmark approves the account
            Subject=subject,
            TextBody=body
        )
        if res['ErrorCode'] == 0:
            return jsonify({"result": "Email successfully sent!", "status": 200}), 200
        return jsonify({"result": e, "status": 400}), 400
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"result": e, "status": 400}), 400