import React, { useState } from 'react';

function ImportTodo({ onImported }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    //FlaskバックエンドのエンドポイントにPOST
    await fetch('http://localhost:5000/api/import_csv', {
      method: 'POST',
      body: formData,
    });
    setFile(null);
    if (onImported) onImported(); // インポート後にリスト再取得など
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
    </div>
  );
}

export default ImportTodo;
