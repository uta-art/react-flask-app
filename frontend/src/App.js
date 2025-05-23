import React, { useState, useEffect } from 'react';
import ImportTodo from './ImportTodo';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState('');

  // 初回マウント時にAPIからToDo取得
  useEffect(() => {
    fetchTodos();
  }, []);

  // ToDo取得処理を共通化
  const fetchTodos = async () => {
    const res = await fetch('http://localhost:5000/api/todos');
    setTodos(await res.json());
  };

  // 新規ToDo追加
  const addTodo = async (e) => {
    e.preventDefault();
    if (!task) return;
    await fetch('http://localhost:5000/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    setTask('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    // ブラウザ標準の確認ダイアログ
    const ok = window.confirm("本当に削除しますか？");
    if (!ok) return;
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: 'DELETE',
    });
    fetchTodos();
  }

  const editTodo = (id, currentTask) => {
    setEditingId(id);
    setEditTask(currentTask);
  }

  const saveTodo = async (id) => {
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: 'PUt',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: editTask }),
    });
    setEditingId(null);
    setEditTask('');
    fetchTodos();
  };

  const cancelEdit = () => {
  setEditingId(null);
  setEditTask('');
  };

  return (
    <div className="container" style={{ marginTop: "2rem", maxWidth: 700 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="mb-4 text-primary text-center">Todoアプリ</h2>
          <form className="d-flex mb-3 gap-2" onSubmit={addTodo}>
            <input
              className="form-control"
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="新しいタスクを入力"
              style={{ minWidth: 0 }}
            />
            <button className="btn btn-primary" type="submit">追加</button>
          </form>
          <ImportTodo onImported={fetchTodos} />
          <table className="table table-striped table-hover mt-4 align-middle" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr style={{ maxWidth: 700 }}>
                <th style={{ width: "60px" }}>id</th>
                <th>タスク</th>
                <th style={{ width: "120px" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {todos.map(todo => (
                <tr key={todo.id}>
                  <td>{todo.id}</td>
                  <td>
                    {editingId === todo.id ? (
                      <div>
                        <input
                          className="form-control"
                          value={editTask}
                          onChange={e => setEditTask(e.target.value)}
                          style={{ width: "100%" }}
                        />
                        <div className="mt-2 d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => saveTodo(todo.id)}
                          >保存</button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEdit}
                          >キャンセル</button>
                        </div>
                      </div>
                    ) : (
                      <span>{todo.task}</span>
                    )}
                  </td>
                  <td className="text-end" style={{ padding: "0.5em", borderBottom: "1px solid #eee" }}>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteTodo(todo.id)}
                        disabled={editingId === todo.id}
                      >削除</button>
                      <button
                        className="btn btn-info btn-sm text-white"
                        onClick={() => editTodo(todo.id, todo.task)}
                        disabled={editingId === todo.id}
                      >編集</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
