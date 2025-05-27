function ExportTodos() {
  const exportTodos = async () => {
    const res = await fetch('http://localhost:5000/api/export_csv');
    const blob = await res.blob();
    // ダウンロード用リンクを作成
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <div>
      <button className="btn btn-outline-primary" onClick={exportTodos}>
        エクスポート
      </button>
    </div>
  );
}

export default ExportTodos;
