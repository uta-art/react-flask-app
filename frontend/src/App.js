import React, { useState, useEffect } from 'react';
import ImportTodo from './ImportTodo';
import ExportTodos from './ExportTodo';

function App() {
  // state追加
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ToDo取得処理
  const fetchTodos = async (pageNum = page) => {
    const res = await fetch(`http://localhost:5000/api/todos?page=${pageNum}&per_page=${perPage}`);
    const data = await res.json();
    setTodos(data.todos);
    setPage(data.page);
    setTotalPages(data.pages);
  };

  useEffect(() => {
    fetchTodos(page, perPage);
    // eslint-disable-next-line
  }, [page, perPage]);

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1); // 件数を変えたら1ページ目に戻す
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
    fetchTodos(page);
  };

  // 削除
  const deleteTodo = async (id) => {
    const ok = window.confirm("本当に削除しますか？");
    if (!ok) return;
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: 'DELETE',
    });
    fetchTodos(page);
  }

  // 編集開始
  const editTodo = (id, currentTask) => {
    setEditingId(id);
    setEditTask(currentTask);
  }

  // 編集保存
  const saveTodo = async (id) => {
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: editTask }),
    });
    setEditingId(null);
    setEditTask('');
    fetchTodos(page);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingId(null);
    setEditTask('');
  };

  // インポート完了時（リスト再取得用）
  const handleImported = () => fetchTodos(page);

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
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
          <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
            <ImportTodo onImported={handleImported} />
            <ExportTodos />
          </div>
          <table className="table table-striped table-hover mt-4 align-middle" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr style={{ maxWidth: 700 }}>
                <th style={{ width: "60px" }}>id</th>
                <th>タスク</th>
                <th style={{ width: "200px" }}>登録日</th>
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
                  <td>{todo.created_at}</td>
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
          {/* ページ送り */}
          <div className="d-flex justify-content-center my-3">
            <button
              className="btn btn-outline-secondary mx-2"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              前へ
            </button>
            <span style={{ lineHeight: "2.4" }}>{page} / {totalPages}</span>
            <button
              className="btn btn-outline-secondary mx-2"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              次へ
            </button>
            <label htmlFor="perPage" className="me-2 mt-2 ">表示件数: </label>
              <select id="perPage" className="form-select d-inline-block" style={{ width: 100 }} value={perPage} onChange={handlePerPageChange}>
                <option value={10}>10件</option>
                <option value={50}>50件</option>
                <option value={100}>100件</option>
              </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
