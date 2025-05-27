from flask import Blueprint, request, jsonify, Response
from .services import add_todo, delete_todo, update_todo, import_todos_from_csv, export_todos_csv, get_paginated_todos, bulk_delete_todos

bp = Blueprint('api', __name__)

@bp.route('/api/todos', methods=['GET'])
def get_todos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    result = get_paginated_todos(page, per_page)
    return jsonify(result)

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

@bp.route('/api/todos/bulk_delete', methods=['POST'])
def bulk_delete():
    ids = request.json.get('ids', [])
    ok, err = bulk_delete_todos(ids)
    if ok:
        return jsonify({"message": "Deleted"}), 200
    return jsonify({"error": err}), 400