from flask import Flask
from Extensions import limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from Routes import register_routes
from datetime import datetime
from helper.Scheduler import start_scheduler
import helper.SetupDatabase as SetupDB

app = Flask(__name__)
CORS(app, origins=[
    "https://monkeymonie.com",
    "https://www.monkeymonie.com"
])

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
    start_scheduler(1)
    app.run(host='0.0.0.0', port=5000)