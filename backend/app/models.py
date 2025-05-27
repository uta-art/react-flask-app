from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timezone

db = SQLAlchemy()
migrate = Migrate()

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(255), nullable=False)
#     email = db.Column(db.String(255), unique=True, nullable=False)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

# class Age(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(255), nullable=False)
#     age = db.Column(db.String(255), nullable=False)
