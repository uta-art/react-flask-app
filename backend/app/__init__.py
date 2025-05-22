from flask import Flask
from flask_cors import CORS
from .models import db, migrate
from .routes import bp

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/postgres"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    app.register_blueprint(bp)
    return app
