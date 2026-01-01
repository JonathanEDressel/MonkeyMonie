from controllers.AuthController import auth_bp
from controllers.UserController import usr_bp
from controllers.AccountController import act_bp
from controllers.PaymentController import pay_bp
from controllers.EventController import evnt_bp
from controllers.ErrorController import error_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(usr_bp, url_prefix='/user')
    app.register_blueprint(act_bp, url_prefix='/act')
    app.register_blueprint(pay_bp, url_prefix='/payment')
    app.register_blueprint(evnt_bp, url_prefix='/event')
    app.register_blueprint(error_bp, url_prefix='/errors')
