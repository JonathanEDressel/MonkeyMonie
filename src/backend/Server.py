from flask import Flask, jsonify, request, abort
# from dotenv import load_dotenv
from Extensions import limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from Routes import register_routes
from datetime import datetime
import helper.SetupDatabase as SetupDB
import helper.Helper as DBHelper
import helper.InitiateConnection as InitiateDB

app = Flask(__name__)
CORS(app)#, origins=["https://monkeymonie.com"])

#add limiting for each user, not whole server...
def run_db_checks():
    SetupDB.validate_db()
    SetupDB.add_columns()

@app.route('/')
def home():
    return "Home route"

limiter.init_app(app)

register_routes(app)

if __name__ == '__main__':
    run_db_checks()
    app.run(host='0.0.0.0', port=5000)