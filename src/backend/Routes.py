from controllers.AuthController import auth_bp
from controllers.UserController import usr_bp
from controllers.AccountController import act_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(usr_bp, url_prefix='/user')
    app.register_blueprint(act_bp, url_prefix='/act')
