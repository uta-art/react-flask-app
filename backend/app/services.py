from .models import db, Todo
import csv
import io

def get_all_todos():
    todos = Todo.query.order_by(Todo.id.desc()).all()
    return [{"id": t.id, "task": t.task} for t in todos]

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
