from flask import jsonify, request, g
from functools import wraps
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import random
import jwt
import os

load_dotenv()

SECRET_KEY=os.getenv("SECRET_KEY")
ALGO_TO_USE=os.getenv("ALGO_TO_USE", "HS256")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set.")

def create_jwt(uuid, username):
    if not uuid or not username:
        return None
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": uuid,
        "username": username,
        "exp": now + timedelta(minutes=120),
        "iat":now
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGO_TO_USE)
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    if not token:
        return None
    return token

def requires_token(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGO_TO_USE])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        g.decoded_token = decoded
        return f(*args, **kwargs)
    return decorator

def generate_otp(otp_len=6):
    try:
        if not isinstance(otp_len, int) or otp_len <= 0:
            print("generate_otp parameters are not valid")
            return None
        
        min = 10 ** (otp_len - 1)
        max = (10 ** otp_len) - 1
        return random.randint(min, max)
    except Exception as e:
        print(f"ERROR: {e}")

# @app.route("/protected", methods=["GET"])
# @token_required
# def protected(decoded):
    # return jsonify({"message": f"Welcome {decoded['username']}!"})