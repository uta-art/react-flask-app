import React, { useState } from 'react';

function ImportTodo({ onImported }) {
  const [file, setFile] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage('');
  };

  const getFileType = (fileName) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.csv')) {
      return 'csv';
    } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      return 'excel';
    }
    return null;
  };

  const handleImport = async () => {
    if (!file) return;
    setIsLoading(true);
    const fileType = getFileType(file.name);
    if (!fileType) {
      setErrorMessage('CSV（.csv）またはExcel（.xlsx, .xls）ファイルを選択してください');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // ファイル形式に応じてエンドポイントを選択
    const endpoint = fileType === 'csv' ? '/api/import_csv' : '/api/import_excel';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setShowToast(true);
        if (onImported) onImported();
        setTimeout(() => setShowToast(false), 7000);
        setFile(null);
        setErrorMessage('');
        // ファイル入力をクリア
        const fileInput = document.getElementById('importFileInput');
        if (fileInput) fileInput.value = '';
      } else {
        setErrorMessage(data.error || 'インポートに失敗しました');
      }
    } catch (error) {
      setErrorMessage('通信エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileTypeDisplay = () => {
    if (!file) return '';
    const fileType = getFileType(file.name);
    return fileType ? `(${fileType.toUpperCase()})` : '';
  };

  return (
    <div className="d-flex justify-content-end">
      <div className="input-group" style={{ maxWidth: 500 }}>
        <input
          id="importFileInput"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="form-control"
          onChange={handleFileChange}
        />
        <button
          className="btn btn-outline-success"
          onClick={handleImport}
          disabled={!file || isLoading}
          type="button"
          title="CSV(.csv)またはExcel(.xlsx, .xls)ファイルをインポート"
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              インポート中...
            </>
          ) : (
            `一括インポート${getFileTypeDisplay()}`
          )}
        </button>
      </div>
      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="alert alert-danger mt-2 position-absolute" role="alert" style={{ top: '100%', right: 0, minWidth: '300px', zIndex: 1000 }}>
          <small>{errorMessage}</small>
        </div>
      )}
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