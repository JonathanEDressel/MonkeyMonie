from flask import Flask
from Extensions import limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from Routes import register_routes
from datetime import datetime
from helper.Scheduler import start_scheduler
import helper.SetupDatabase as SetupDB

app = Flask(__name__)

# Configure ProxyFix to trust proxy headers (X-Forwarded-For, X-Forwarded-Proto, etc.)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
CORS(
        app, 
        methods=["GET", "POST"],
        origins=["https://monkeymonie.com", "https://www.monkeymonie.com", "http://localhost:4200", "http://127.0.0.1:4200" ],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
        max_age=3600
    )

def run_db_checks():
    SetupDB.validate_db()
    SetupDB.add_columns()
    SetupDB.update_columns()

@app.route('/')
def home():
    return "Home route"

limiter.init_app(app)

register_routes(app)

start_scheduler(1)

if __name__ == '__main__':
    run_db_checks()
    app.run(host='0.0.0.0', port=5000)