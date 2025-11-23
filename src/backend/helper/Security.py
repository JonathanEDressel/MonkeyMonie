from flask import jsonify, request, g
from functools import wraps
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import controllers.UserDbContext as _usrDbContext
import helper.Helper as DBHelper
import random
import jwt
import os

load_dotenv()

SECRET_KEY=os.getenv("SECRET_KEY")
ALGO_TO_USE=os.getenv("ALGO_TO_USE", "HS256")
JWT_ISSUER=os.getenv("JWT_ISSUER")
JWT_AUDIENCE=os.getenv("JWT_AUDIENCE")
TOKEN_LIFETIME = 15
MAX_TOKEN_LENGTH = 2000

if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set.")

def create_jwt(uuid, username, extra_claims=None, kid=None):
    if not uuid or not username:
        return None
    now = datetime.now(timezone.utc)
    expiration = now + timedelta(minutes=TOKEN_LIFETIME)
    print(JWT_AUDIENCE)
    payload = {
        "user_id": uuid,
        "username": username,
        "exp": expiration,
        "iat": now, #iat - time it was issued
        "nbf": now, #nbf - cannot be issued befre x time to be valid
        "iss": JWT_ISSUER, #iss - identifies the org. that created and signed the token. shows where the token originated
        # "aud": JWT_AUDIENCE, #aud - identifies the recipients for whom the token is intended. Prevents a token to be used for another system
        "jti": str(uuid) + "-" + now.isoformat()
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
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return jsonify({"error": "Missing Authorization header"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format"}), 401

        token = parts[1]

        try:
            decoded = jwt.decode(
                jwt=token,
                key=SECRET_KEY,
                algorithms=[ALGO_TO_USE],
                issuer=JWT_ISSUER,
                # audience=JWT_AUDIENCE,
                options={
                    "require": ["exp", "iat", "jti", "iss"], #aud
                    "verify_exp": True,
                    "verify_iss": True,
                    # "verify_aud": True
                }
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidAudienceError:
            return jsonify({"error": "Invalid token audience"}), 401
        except jwt.InvalidIssuerError:
            return jsonify({"error": "Invalid token issuer"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        
        jti = decoded.get("jti")
        if not jti:
            return jsonify({"error": "Token is missing jti"}), 401
        if token_is_revoked(jti):
            return jsonify({"error": "Token is revoked"}), 401
        username = decoded.get("username")
        if not username:
            return jsonify({"error": "Token is missing username"}), 401

        usr = _usrDbContext.get_user_by_username(username)
        if not usr:
            return jsonify({"error": "User not found"}), 404
        
        #add a isActive attr. to UserModel and check if the account is active

        g.decoded_token = decoded
        g.current_user = usr
        return f(*args, **kwargs)
    return decorator

def token_is_revoked(dec_jwt):
    try:
        jti = dec_jwt.get('jti')
        if not jti:
            return True
        sql = "SELET 1 FROM RevokedTokens WHERE jti = %s LIMIT 1"
        params = (jti,)
        res = DBHelper.run_query(sql, params, True)
        return res is not None
    except Exception as e:
        return False

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