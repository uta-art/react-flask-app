from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import text

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/postgres"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

DATABASE_URL = os.environ.get('DATABASE_URL')
engine = create_engine(DATABASE_URL)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

from models import *

@app.route('/api/todos', methods=['GET'])
def get_todos():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM todos ORDER BY id DESC"))
            todos = [{"id": row[0], "task": row[1]} for row in result]
        return jsonify(todos)
    except Exception as e:
        # テーブルがなければ空リスト返却
        if 'UndefinedTable' in str(e):
            return jsonify([])
        return jsonify({"error": str(e)}), 500

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    task = data.get('task')
    if not task:
        return jsonify({"error": "Task is required"}), 400
    try:
        with engine.begin() as conn:  # ← ここで「autocommit」
            conn.execute(text("INSERT INTO todos (task) VALUES (:task)"), {"task": task})
    except Exception as e:
        if 'UndefinedTable' in str(e):
            with engine.begin() as conn:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS todos (
                        id SERIAL PRIMARY KEY,
                        task TEXT NOT NULL
                    )
                """))
                conn.execute(text("INSERT INTO todos (task) VALUES (:task)"), {"task": task})
        else:
            return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Added"}), 201

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    try:
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM todos WHERE id = :id"), {"id": todo_id})
        return jsonify({"message": "Deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/todos/<int:todo_id>', methods=['put'])
def edit_todo(todo_id):
    data = request.get_json()
    new_task = data.get('task')
    try:
        with engine.begin() as conn:
            conn.execute(text("UPDATE todos SET task = :task WHERE id = :id"),
                        {"task": new_task, "id": todo_id})
        return jsonify({"message": ""}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
