import React, { useState, useEffect } from 'react';
import ImportTodo from './ImportTodo';
import ExportTodos from './ExportTodo';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

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
    const res = await fetch('http://localhost:5000/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task,
        deadline: deadline || null
      }),
    });
    setTask('');
    setDeadline('');
    fetchTodos(page);
    if (res.ok) {
      setMessage(true);
      setTimeout(() => setMessage(false), 7000)
    }
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
  const editTodo = (id, currentTask, currentDeadline) => {
    setEditingId(id);
    setEditTask(currentTask);
    // 期限をローカル時間の形式に変換（datetime-local用）
    if (currentDeadline) {
      const date = new Date(currentDeadline.replace(' ', 'T') + ':00');
      const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditDeadline(localISOTime);
    } else {
      setEditDeadline('');
    }
  }

  // 編集保存
  const saveTodo = async (id) => {
    // 期限をUTC形式に変換
    let deadlineToSend = null;
    if (editDeadline) {
      const localDate = new Date(editDeadline);
      deadlineToSend = localDate.toISOString();
    }

    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: editTask,
        deadline: deadlineToSend
      }),
    });
    setEditingId(null);
    setEditTask('');
    setEditDeadline('');
    fetchTodos(page);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingId(null);
    setEditTask('');
    setEditDeadline('');
  };

  // インポート完了時（リスト再取得用）
  const handleImported = () => fetchTodos(page);

  const handleBulkDelete = async () => {
    if (!window.confirm("選択したタスクを一括削除します。よろしいですか？")) return;
    await fetch('http://localhost:5000/api/todos/bulk_delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });
    setSelectedIds([]);
    setSelectMode(false);
    fetchTodos(page);
  };

// 全選択/全解除の処理
  const handleSelectAll = () => {
    if (selectedIds.length === todos.length) {
      // 全て選択されている場合は全解除
      setSelectedIds([]);
    } else {
      // 一部または何も選択されていない場合は全選択
      setSelectedIds(todos.map(todo => todo.id));
    }
  };

  // 期限のローカル時間での表示用変換（新規追加用）
  const handleDeadlineChange = (e) => {
    setDeadline(e.target.value);
  };

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="mb-4 text-primary text-center">Todoアプリ</h2>
          <form className="mb-3" onSubmit={addTodo}>
            <div className="row g-2 align-items-center">
              <div className="col">
                <input
                  className="form-control"
                  value={task}
                  onChange={e => setTask(e.target.value)}
                  placeholder="新しいタスクを入力"
                />
              </div>
              <div className="col-auto">
                <input
                  type="datetime-local"
                  className="form-control"
                  value={deadline}
                  onChange={handleDeadlineChange}
                  style={{ width: "200px" }}
                  title="期限（任意）"
                />
              </div>
              <div className="col-auto">
                <button className="btn btn-primary" type="submit">追加</button>
              </div>
            </div>
          </form>
          {/* 操作ボタン群 */}
          <div className="d-flex justify-content-end align-items-center gap-2 mb-3 flex-wrap">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSelectMode(!selectMode);
                setSelectedIds([]); // 選択解除
              }}
            >
              {selectMode ? '選択解除' : '選択'}
            </button>
            {selectMode && (
              <button
                className="btn btn-danger"
                disabled={selectedIds.length === 0}
                onClick={handleBulkDelete}
              >
                一括削除
              </button>
            )}
            <ImportTodo onImported={handleImported} />
            <ExportTodos />
          </div>
          <table className="table table-striped table-hover mt-4 align-middle" style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr style={{ maxWidth: 700 }}>
                {selectMode && <th style={{ width: "100px" }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleSelectAll}
                  >
                    {selectedIds.length === todos.length ? "解除" : "全選択"}
                  </button>
                </th>}
                <th>タスク</th>
                <th style={{ width: "180px" }}>期限</th>
                <th style={{ width: "180px" }}>登録日</th>
                <th style={{ width: "120px" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {todos.map(todo => (
                <tr key={todo.id}>
                  {selectMode && (
                    <td>
                      <div className="d-flex justify-content-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(todo.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, todo.id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== todo.id));
                            }
                          }}
                        />
                      </div>
                    </td>
                  )}
                  <td>
                    {editingId === todo.id ? (
                      <div>
                        <input
                          className="form-control mb-2"
                          value={editTask}
                          onChange={e => setEditTask(e.target.value)}
                          style={{ width: "100%" }}
                        />
                        <input
                          type="datetime-local"
                          className="form-control mb-2"
                          value={editDeadline}
                          onChange={e => setEditDeadline(e.target.value)}
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
                  <td>{todo.deadline || '未設定'}</td>
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
                        onClick={() => editTodo(todo.id, todo.task, todo.deadline)}
                        disabled={editingId === todo.id}
                      >編集</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ページネーション */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <label htmlFor="perPageSelect" className="form-label me-2">表示件数:</label>
              <select
                id="perPageSelect"
                className="form-select"
                value={perPage}
                onChange={handlePerPageChange}
                style={{ width: "auto", display: "inline-block" }}
              >
                <option value={5}>5件</option>
                <option value={10}>10件</option>
                <option value={20}>20件</option>
                <option value={50}>50件</option>
              </select>
            </div>

            <nav aria-label="Page navigation">
              <ul className="pagination mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => fetchTodos(page - 1)}
                    disabled={page === 1}
                  >前へ</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => fetchTodos(pageNum)}
                    >{pageNum}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => fetchTodos(page + 1)}
                    disabled={page === totalPages}
                  >次へ</button>
                </li>
              </ul>
            </nav>
          </div>

          {/* 成功メッセージ */}
          {message && (
            <div
              className="toast show position-absolute top-0 end-0"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              style={{ minWidth: 200, zIndex: 9999 }}
            >
              <div className="toast-header bg-primary text-white">
                <strong className="me-auto">通知</strong>
              </div>
              <div className="toast-body">
                タスクを追加しました
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;