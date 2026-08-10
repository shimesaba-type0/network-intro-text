# Mermaid図をSVGに変換する手順

ADR-001（図版制作方針）に基づき、時系列・関係性を表す図は Mermaid で記述し、
mermaid-cli (`mmdc`) で**事前にSVGへレンダリングしてから**Markdown原稿に埋め込む。
（Vivliostyleにmermaidコードブロックをそのまま渡してブラウザ内でレンダリングさせる方式は採用しない。
ビルドを純粋なCSS組版に保ち、Web/PDF両方で常に同じ見た目のSVGになるようにするため。）

配置は draw.io で作る図（`docs/drawio-to-svg.md` の対象、配置に意味を持たせたい図）と役割分担する。
時系列・シーケンス・フローチャート・状態遷移などは Mermaid、ネットワーク構成図など座標配置が
重要な図は draw.io、を目安にする。

## ディレクトリ構成

```
assets/
  mermaid/    … Mermaid記法のソースファイル（*.mmd）
  images/     … レンダリング済みSVG（Markdown原稿から参照する成果物）
  drawio/     … draw.ioのソースファイル（*.drawio）
```

`assets/mermaid/*.mmd` と `assets/images/*.svg` は、拡張子を除いて同じファイル名・同じ相対パスで
対応させる（例: `assets/mermaid/03-tcp-handshake.mmd` → `assets/images/03-tcp-handshake.svg`）。

## 1. 事前準備

このリポジトリの依存関係に `@mermaid-js/mermaid-cli` を含めてあるので、`npm install` 済みであれば
追加のインストールは不要。

```bash
npm install
```

コンテナ環境やCIなど、**rootユーザーで実行する環境**では Puppeteer が起動するChromiumのサンドボックスが
使えずエラーになることがある（`Running as root without --no-sandbox is not supported`）。
その場合は `assets/mermaid/puppeteer-config.json` を経由してサンドボックスを無効化する
（このリポジトリには最初から用意してある）。

```json
{
  "args": ["--no-sandbox"]
}
```

## 2. 図を1つ変換する（手動）

1. `assets/mermaid/` 配下に `.mmd` ファイルを作成し、Mermaid記法で図を書く。

   ```mermaid
   sequenceDiagram
       participant Client
       participant Server
       Client->>Server: SYN
       Server-->>Client: SYN-ACK
       Client->>Server: ACK
       Note over Client,Server: TCP 3ウェイハンドシェイク成立
   ```

   実例: [`docs/examples/sample-sequence.mmd`](./examples/sample-sequence.mmd)

2. `mmdc` でSVGに変換する。

   ```bash
   npx mmdc \
     -i assets/mermaid/03-tcp-handshake.mmd \
     -o assets/images/03-tcp-handshake.svg \
     -b transparent \
     -p assets/mermaid/puppeteer-config.json
   ```

   - `-b transparent`: 背景を透過にする（Web/PDFどちらの背景色にも馴染ませるため）
   - `-p`: 上記のPuppeteer設定を指定（rootユーザー実行時のサンドボックス回避）

3. 生成されたSVGを確認する（ブラウザで直接開くか、`vivliostyle preview` で原稿に埋め込んだ状態を確認する）。

生成例: [`docs/examples/sample-sequence.svg`](./examples/sample-sequence.svg)
（上記のサンプルコマンドで実際に生成したもの）

## 3. まとめて変換する（一括スクリプト）

`assets/mermaid/` 配下の `.mmd` を再帰的に探索し、対応するパスで `assets/images/` にSVGを
まとめて出力するスクリプトを用意してある。

```bash
npm run mermaid:build
```

内部的には `scripts/build-mermaid.mjs` が各ファイルに対して `mmdc` を実行する
（ローカルに `mmdc` が無い場合は自動的に `npx @mermaid-js/mermaid-cli` にフォールバックする）。

## 4. Markdown原稿への埋め込み

生成したSVGは、原稿（`manuscript/*.md`）から通常のMarkdown画像記法で参照する。

```markdown
![TCPの3ウェイハンドシェイク](../assets/images/03-tcp-handshake.svg)
```

Mermaidのソース（`.mmd`）は原稿には含めず、あくまで生成前のソースとしてリポジトリに残しておく
（図の修正時はソースを直して再度 `npm run mermaid:build` を実行する）。

## 5. 運用ルール

- `.mmd`（ソース）と`.svg`（生成物）は**両方ともGitにコミットする**。
  Vivliostyleのビルド環境にPuppeteer/Chromiumのセットアップを要求しないため、CI（PRプレビュー・
  本番デプロイ）ではSVGを直接使う。CI側で`mmdc`を都度実行することはしない。
- 図を修正したら、必ず `npm run mermaid:build` を実行してSVGを再生成し、`.mmd` と `.svg` を
  セットでコミットする。
- ファイル名は原稿内での用途がわかるように、章番号などを接頭辞に付けることを推奨する
  （例: `03-tcp-handshake.mmd`）。
