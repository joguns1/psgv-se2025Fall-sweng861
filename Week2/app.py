import os
from flask import Flask, redirect, url_for, session, render_template, jsonify
from authlib.integrations.flask_client import OAuth
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token
from config import Config
from flask_cors import CORS


# ----------------------
# Flask App & Config
# ----------------------
app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
oauth = OAuth(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
# Add JWT
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
jwt = JWTManager(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    social_id = db.Column(db.String(200), unique=True, nullable=False)
    provider = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(200))
    email = db.Column(db.String(200))

    def __repr__(self):
        return f"<User {self.name}>"


# ----------------------
# OAuth Providers
# ----------------------
google = oauth.register(
    name='google',
    client_id=Config.GOOGLE_CLIENT_ID,
    client_secret=Config.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

linkedin = oauth.register(
    name='linkedin',
    client_id=Config.LINKEDIN_CLIENT_ID,
    client_secret=Config.LINKEDIN_CLIENT_SECRET,
    access_token_url='https://www.linkedin.com/oauth/v2/accessToken',
    authorize_url='https://www.linkedin.com/oauth/v2/authorization',
    api_base_url='https://api.linkedin.com/v2/',
    client_kwargs={'scope': 'r_liteprofile r_emailaddress'}
)

# ----------------------
# Routes
# ----------------------
@app.route("/")
def index():
    return render_template("login.html")


@app.route('/login/<provider>')
def login(provider):
    if provider == 'google':
        nonce = os.urandom(16).hex()
        session['nonce'] = nonce
        redirect_uri = url_for('google_callback', _external=True)
        return google.authorize_redirect(redirect_uri, nonce=nonce)

    elif provider == 'linkedin':
        redirect_uri = url_for('authorize', provider='linkedin', _external=True)
        return linkedin.authorize_redirect(redirect_uri)

    return "Unsupported provider"


@app.route('/authorize/<provider>')
def authorize(provider):
    if provider == 'linkedin':
        try:
            access_token = linkedin.authorize_access_token()
            profile = linkedin.get('me').json()
            email_resp = linkedin.get(
                'emailAddress?q=members&projection=(elements*(handle~))'
            ).json()
            email = email_resp['elements'][0]['handle~']['emailAddress']
            user_info = {**profile, "email": email}
        except Exception as e:
            return f"Error during LinkedIn login: {str(e)}"

        social_id = user_info.get("id")
        user = User.query.filter_by(social_id=social_id, provider=provider).first()
        if not user:
            user = User(
                social_id=social_id,
                provider=provider,
                name=user_info.get("localizedFirstName") or user_info.get("name"),
                email=user_info.get("email")
            )
            db.session.add(user)
            db.session.commit()

        # Issue JWT
        access_token = create_access_token(identity=str(user.id),additional_claims={"role": "user"})
        # Redirect back to React with token
        return redirect(f"http://localhost:3000/login?token={access_token}")

    return "Unsupported provider"


@app.route("/login/callback/google")
def google_callback():
    try:
        token = google.authorize_access_token()
        nonce = session.pop('nonce', None)
        user_info = google.parse_id_token(token, nonce=nonce)
    except Exception as e:
        return f"Error during Google login: {str(e)}"

    user = User.query.filter_by(social_id=user_info["sub"], provider="google").first()
    if not user:
        user = User(
            social_id=user_info["sub"],
            provider="google",
            name=user_info.get("name"),
            email=user_info.get("email")
        )
        db.session.add(user)
        db.session.commit()

    # Issue JWT
    access_token = create_access_token(identity={"id": user.id, "role": "user"})
    # Redirect back to React with token
    return redirect(f"http://localhost:3000/login?token={access_token}")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
