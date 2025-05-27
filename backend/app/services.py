from .models import db, Todo
import csv
import io
from io import StringIO
from zoneinfo import ZoneInfo

def get_paginated_todos(page=1, per_page=10):
    pagination = Todo.query.order_by(Todo.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    todos = [
        {"id": todo.id, "task": todo.task, "created_at": _to_jst(todo.created_at) if todo.created_at else None}
        for todo in pagination.items
    ]
    return {
        "todos": todos,
        "total": pagination.total,
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages
    }

def add_todo(task):
    if not task:
        return False, "Task is required"
    todo = Todo(task=task)
    db.session.add(todo)
    db.session.commit()
    return True, None

def delete_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return False, "Not found"
    db.session.delete(todo)
    db.session.commit()
    return True, None

def update_todo(todo_id, new_task):
    todo = Todo.query.get(todo_id)
    if not todo:
        return False, "Not found"
    todo.task = new_task
    db.session.commit()
    return True, None

def import_todos_from_csv(file_storage):
    """CSVファイル（FileStorage）からToDoを一括インポート"""
    stream = io.StringIO(file_storage.stream.read().decode('utf-8'))
    reader = csv.reader(stream)
    count = 0
    for row in reader:
        if not row or not row[0].strip():
            continue
        todo = Todo(task=row[0].strip())
        db.session.add(todo)
        count += 1
    db.session.commit()
    return count

def export_todos_csv():
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['id', 'task', 'created_at'])
    todos = Todo.query.order_by(Todo.id.desc()).all()
    for todo in todos:
        writer.writerow([todo.id, todo.task, todo.created_at])
    output.seek(0)
    return output

def _to_jst(dt):
    if dt is None:
        return None
    # UTC→JSTへ変換
    return dt.astimezone(ZoneInfo("Asia/Tokyo")).strftime('%Y/%m/%d %H:%M:%S')