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
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Todoアプリ</h2>
      <form onSubmit={addTodo}>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="新しいタスクを入力"
          style={{ width: "70%", marginRight: "1rem" }}
        />
        <button type="submit">追加</button>
      </form>
      <ImportTodo onImported={fetchTodos} />
      <table style={{ width: "100%", marginTop: "2rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5em" }}>id</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5em" }}>タスク</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5em" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {todos.map(todo => (
            <tr key={todo.id}>
              <td style={{ padding: "0.5em", borderBottom: "1px solid #eee" }}>{todo.id}</td>
              <td style={{ padding: "0.5em", borderBottom: "1px solid #eee" }}>
                {editingId === todo.id ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <input
                      value={editTask}
                      onChange={e => setEditTask(e.target.value)}
                      style={{ width: "90%" }}
                    />
                    <div style={{ marginTop: "0.5em" }}>
                      <button
                        style={{ color: 'green', cursor: 'pointer', marginRight: '5px' }}
                        onClick={() => saveTodo(todo.id)}
                      >保存</button>
                      <button
                        style={{ color: 'gray', cursor: 'pointer' }}
                        onClick={cancelEdit}
                      >キャンセル</button>
                    </div>
                  </div>
                ) : (
                  todo.task
                )}
              </td>
              <td style={{ padding: "0.5em", borderBottom: "1px solid #eee" }}>
                <button
                  style={{ color: 'red', cursor: 'pointer', marginRight: '5px' }}
                  onClick={() => deleteTodo(todo.id)}
                  disabled={editingId === todo.id}
                >削除</button>
                <button
                  style={{ color: 'blue', cursor: 'pointer' }}
                  onClick={() => editTodo(todo.id, todo.task)}
                  disabled={editingId === todo.id}
                >編集</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
