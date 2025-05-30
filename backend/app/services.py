from .models import db, Todo
import csv
import io
from io import StringIO
from zoneinfo import ZoneInfo
from datetime import datetime

def get_paginated_todos(page=1, per_page=10):
    pagination = Todo.query.order_by(Todo.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    todos = [
        {"id": todo.id, "task": todo.task, "deadline": _to_jst(todo.deadline) if todo.deadline else None, "created_at": _to_jst(todo.created_at) if todo.created_at else None}
        for todo in pagination.items
    ]
    return {
        "todos": todos,
        "total": pagination.total,
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages
    }

def add_todo(task, deadline=None):
    if not task:
        return False, "Task is required"
    # 期限の文字列をdatetimeオブジェクトに変換
    deadline_dt = None
    if deadline:
        try:
            deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
        except ValueError:
            return False, "Invalid deadline format"
    todo = Todo(task=task, deadline=deadline_dt)
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

def update_todo(todo_id, new_task, new_deadline=None):
    todo = Todo.query.get(todo_id)
    if not todo:
        return False, "Not found"
    todo.task = new_task
    # 期限の更新
    if new_deadline:
        try:
            todo.deadline = datetime.fromisoformat(new_deadline.replace('Z', '+00:00'))
        except ValueError:
            return False, "Invalid deadline format"
    else:
        todo.deadline = None
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
        task = row[0].strip()
        deadline = None
        # CSV に期限列がある場合の処理（2列目）
        if len(row) > 1 and row[1].strip():
            try:
                deadline = datetime.fromisoformat(row[1].strip().replace('Z', '+00:00'))
            except ValueError:
                pass  # 期限の形式が不正な場合は None のまま
        todo = Todo(task=task, deadline=deadline)
        db.session.add(todo)
        count += 1
    db.session.commit()
    return count

def export_todos_csv():
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['id', 'task', 'deadline', 'created_at'])
    todos = Todo.query.order_by(Todo.id.desc()).all()
    for todo in todos:
        writer.writerow([
            todo.id,
            todo.task,
            todo.deadline.isoformat() if todo.deadline else '',
            todo.created_at
        ])
    output.seek(0)
    return output

def bulk_delete_todos(ids):
    try:
        Todo.query.filter(Todo.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
        return True, None
    except Exception as e:
        db.session.rollback()
        return False, str(e)

def _to_jst(dt):
    if dt is None:
        return None
    # UTC→JSTへ変換
    return dt.astimezone(ZoneInfo("Asia/Tokyo")).strftime('%Y/%m/%d %H:%M')