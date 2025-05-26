from flask import Blueprint, request, jsonify, Response
from .services import get_all_todos, add_todo, delete_todo, update_todo, import_todos_from_csv, export_todos_csv

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

@bp.route('/api/import_csv', methods=['POST'])
def import_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'ファイルがありません'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'ファイルが選択されていません'}), 400

    try:
        count = import_todos_from_csv(file)
        return jsonify({'message': f'{count}件インポートしました'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/export_csv', methods=['GET'])
def export_csv():
    output = export_todos_csv()
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment; filename=todos.csv"}
    )