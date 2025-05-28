# React Flask App

React + FlasのDockerベースお試し開発環境構築メモ

## プロジェクト構成

```
react-flask-app/
├── .gitignore
├── README.md              # このファイル
├── backup.sql             # データベースバックアップ
├── docker-compose.yml     # サービス定義
├── backend/               # Flaskバックエンド
│   ├── __pycache__/       # Pythonキャッシュ
│   ├── app/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   ├── models.py      # データベースモデル
│   │   ├── routes.py      # APIルート定義
│   │   └── services.py    # ビジネスロジック
│   ├── migrations/        # データベースマイグレーション
│   ├── Dockerfile         # Dockerイメージ定義
│   ├── requirements.txt   # Pythonパッケージ依存関係
│   └── run.py            # アプリケーション起動スクリプト
└── frontend/             # Reactフロントエンド
    ├── node_modules/     # npmパッケージ
    ├── public/           # 静的ファイル
    ├── src/              # ソースコード
    │   ├── App.css       # アプリケーションスタイル
    │   ├── App.js        # メインコンポーネント
    │   ├── App.test.js   # テストファイル
    │   ├── ExportTodo.js # Todo エクスポート機能
    │   ├── ImportTodo.js # Todo インポート機能
    │   ├── index.css     # グローバルスタイル
    │   ├── index.js      # エントリーポイント
    │   ├── logo.svg      # ロゴファイル
    │   ├── reportWebVitals.js # パフォーマンス測定
    │   └── setupTests.js # テスト設定
    ├── .gitignore        # Git除外設定
    ├── Dockerfile        # Dockerイメージ定義
    ├── package-lock.json # パッケージロックファイル
    └── package.json      # npmパッケージ設定
```

## 必要なツール

- **Windows 11** または **Windows 10**
- **WSL2** + **Ubuntu**
- **Docker Engine**（Docker Desktopは不要）

## セットアップ手順

### 1. WSL2 + Ubuntuのインストール

Windowsターミナル（管理者権限）で以下のコマンドを実行し、Ubuntuをインストールします：

```bash
wsl --install
```

インストール完了後、システムを再起動してください。

**注意**: 再起動後にUbuntuが自動的に開かない場合は、Windowsの検索機能を使って「Ubuntu」と入力し、Ubuntuアプリケーションを検索して手動で起動してください。初回起動時にはユーザー名とパスワードの設定が求められます。

### 2. WSL2の設定確認

Ubuntuが起動したら、以下のコマンドでWSL2のバージョンを確認します：

```bash
wsl --list --verbose
```

Ubuntu が VERSION 2 で動作していることを確認してください。

### 3. Docker Engineのインストール（Docker Desktopは不要）

Ubuntu側のターミナルで以下のコマンドを実行します：

```bash
sudo apt-get update
curl -fsSL https://get.docker.com/ | sh
sudo service docker status
```

Docker サービスが起動していない場合は、以下のコマンドで起動してください：

```bash
sudo service docker start
```

動作確認のため、以下のコマンドを実行します：

```bash
docker run hello-world
```

無事に導入ができていれば、以下の出力がコンソールに確認できます：

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

### 4. Docker Composeのインストール

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose -v
```

### 5. sudoなしでdockerコマンドが実行できるようにする

```bash
sudo usermod -aG docker $USER
```

**重要**: 設定を反映するため、ターミナルを再起動または `exit` → 再ログインしてください。

### 6. プロジェクトのクローンと起動

```bash
# ホームディレクトリに移動
cd ~

# 作業用ディレクトリを作成（任意の名前）
mkdir projects
cd projects

# プロジェクトをクローン
git clone https://github.com/yourname/react-flask-app.git
cd react-flask-app

# Docker Composeでサービスを起動
docker-compose up --build
```

### 7. VSCode開発環境の設定

プロジェクトの開発にはVSCodeを使用することを推奨します。

#### 7.1 VSCodeのインストール（ローカルPC）

公式サイトよりダウンロードしてインストールしてください：
https://code.visualstudio.com/

#### 7.2 VSCodeプラグインのインストール（ローカルPC）

マーケットプレイスより、以下のプラグインをインストールしてください：

- **WSL** - WSL2環境との連携
- **Dev Containers** - Dockerコンテナ内での開発
- **Docker** - Docker関連ファイルの編集支援

#### 7.3 VSCodeでWSLに接続する

1. VSCodeを起動
2. `Ctrl + Shift + P` でコマンドパレットを開く
3. `WSL: Connect to WSL` を選択
4. WSL環境に接続後、プロジェクトフォルダを開く：
   - VSCodeのメニューから `File > Open Folder` を選択
   - `/home/ユーザー名/projects/react-flask-app` を選択
   
   または、WSLターミナル内でプロジェクトディレクトリに移動してから：
   ```bash
   cd ~/projects/react-flask-app
   code .
   ```

これで、VSCodeからWSL環境内のプロジェクトを直接編集できるようになります。

## 開発の流れ（Tips）

- **パッケージ管理**: 必要なPython/Node.jsパッケージはDockerコンテナ内で自動的にインストールされます
- **ホットリロード対応**: React/Flaskどちらも「ホットリロード」に対応。`src/`や`app/`ディレクトリを編集すれば即反映されます
- **データ永続化**: DBデータはDockerボリューム（postgres-data）で永続化されています
- **VSCode連携**: WSL環境内のプロジェクトをVSCodeで直接編集・デバッグできます
- **コンテナ開発**: Dev Containersプラグインを使用することで、Dockerコンテナ内で直接開発することも可能です

## 開発環境へのアクセス

- **フロントエンド（React）**: http://localhost:3000
- **バックエンド（Flask）**: http://localhost:5000

## 開発コマンド

### サービスの起動

```bash
# バックグラウンドで起動
docker-compose up -d

# ログを表示しながら起動
docker-compose up
```

### サービスの停止

```bash
# サービス停止
docker-compose down

# ボリュームも含めて完全削除
docker-compose down -v
```

### ログの確認

```bash
# 全サービスのログ
docker-compose logs

# 特定のサービスのログ
docker-compose logs frontend
docker-compose logs backend
```

### コンテナ内でのコマンド実行

```bash
# バックエンドコンテナ内でシェル実行
docker-compose exec backend bash

# フロントエンドコンテナ内でシェル実行
docker-compose exec frontend bash
```

## トラブルシューティング

### Dockerサービスが起動しない場合

```bash
# Dockerサービスの状態確認
sudo service docker status

# Dockerサービスの手動開始
sudo service docker start
```

### ポートが使用中の場合

他のプロセスがポート3000や5000を使用している場合は、該当プロセスを停止するか、`docker-compose.yml`でポート番号を変更してください。

### WSL2でのファイルパーミッション問題

WSL2内でファイルのパーミッション問題が発生する場合：

```bash
# プロジェクトディレクトリの権限設定
sudo chown -R $USER:$USER .
chmod -R 755 .
```

