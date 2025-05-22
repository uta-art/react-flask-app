from flask import Blueprint, request, jsonify
from .services import get_all_todos, add_todo, delete_todo, update_todo

bp = Blueprint('api', __name__)

@bp.route('/api/todos', methods=['GET'])
def get_todos():
    todos = get_all_todos()
    return jsonify(todos)

@bp.route('/api/todos', methods=['POST'])
def add_todo_route():
    data = request.get_json()
    task = data.get('task')
    ok, err = add_todo(task)
    if ok:
        return jsonify({"message": "Added"}), 201
    return jsonify({"error": err}), 400

@bp.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo_route(todo_id):
    ok, err = delete_todo(todo_id)
    if ok:
        return jsonify({"message": "Deleted"}), 200
    return jsonify({"error": err}), 400

@bp.route('/api/todos/<int:todo_id>', methods=['PUT'])
def edit_todo_route(todo_id):
    data = request.get_json()
    new_task = data.get('task')
    ok, err = update_todo(todo_id, new_task)
    if ok:
        return jsonify({"message": "Updated"}), 200
    return jsonify({"error": err}), 400
