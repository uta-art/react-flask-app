import React, { useState } from 'react';

function ImportTodo({ onImported }) {
  const [file, setFile] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    //FlaskバックエンドのエンドポイントにPOST
    const res = await fetch('http://localhost:5000/api/import_csv', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      setShowToast(true);
      if (onImported) onImported();
      setTimeout(() => setShowToast(false), 7000); // 2秒で消す
    }
    setFile(null);
  };

  return (
    <div className="d-flex justify-content-end">
      <div className="input-group" style={{ maxWidth: 500 }}>
        <input
          type="file"
          accept=".csv"
          className="form-control"
          onChange={handleFileChange}
        />
        <button
          className="btn btn-outline-success"
          onClick={handleImport}
          disabled={!file}
          type="button"
        >
          一括インポート
        </button>
      </div>
      {/* トースト（ポップアップ通知） */}
      {showToast && (
        <div
          className="toast show position-absolute top-0 end-0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ minWidth: 200, zIndex: 9999 }}
        >
          <div className="toast-header bg-success text-white">
            <strong className="me-auto">通知</strong>
          </div>
          <div className="toast-body">
            インポートに成功しました
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportTodo;
