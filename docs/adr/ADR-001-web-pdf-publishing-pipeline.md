# ADR-001: Web/PDF公開パイプラインおよび図版制作方針

- Status: Accepted
- Date: 2026-08-10

## Context（背景）

「ネットワーク入門テキスト（仮）」は、Markdown原稿1本からWeb版とPDF版の両方を生成・公開したい。
執筆・レビュー・公開の各段階で、以下を満たす構成が必要だった。

- 原稿はできるだけ1つのソースから複数フォーマットへ変換したい（Single Source Multi Output）。
- GitHub上でホスティングし、PRの段階でWeb/PDF双方のプレビューを確認できるようにしたい。
- コンテンツは非営利・改変禁止で共有したいが、GitHubの組み込みライセンス一覧には該当ライセンスがない。
- 図版は種類によって適した作図ツールが異なる（時系列・関係性を表す図と、配置そのものに意味を
  持たせたい図）。

## Decision（決定事項）

### レンダラー: Vivliostyle CLI（Single Source Multi Output）

Markdown原稿から、Web(WebPub/HTML)とPDFを同時にビルドする。原稿を二重管理しない。

### ホスティング: GitHub Pages「Deploy from a branch」

デプロイソースは「Deploy from a branch」方式（`gh-pages`ブランチ）を採用する。PRプレビューに
使う`pr-preview-action`が「GitHub Actions」デプロイ方式と非互換のため、両立できる
「Deploy from a branch」に統一する。

### コンテンツライセンス: CC BY-NC-ND 4.0

表示 - 非営利 - 改変禁止 4.0 国際。GitHubの組み込みライセンス一覧にはないため、`LICENSE.md`を
手動で用意し、正式条文（英語）と日本語でのかみ砕いた説明を併記する。

ライセンス表記は3階層で行う。

1. Web共通フッター（全ページ）: 著者名・ライセンス名の1行 + legalcodeへの参照
2. Web/PDF共通の専用ページ: 条件のかみ砕いた説明
3. PDF/Web共通で末尾に置く奥付ページ: フルの説明（書誌情報を含む）

### 図版: Mermaid と draw.io の使い分け、事前SVGレンダリング

- Mermaid: 時系列・関係性中心の図（シーケンス図、フローチャート等）
- draw.io: 配置（レイアウト）そのものに意味を持たせたい図（ネットワーク構成図等）

いずれも、最終原稿にはビルド前に静的SVGへレンダリングした画像として埋め込む。原稿ビルド時に
Mermaid/draw.ioのレンダリングエンジンを都度呼び出す方式は採らない（Web/PDFで見た目が変わらない
ようにするため、また、CI環境にヘッドレスブラウザ等のレンダリング環境を常設するコストを避けるため）。

### Web版のViewer: 自己ホストせず公式へリンク

Vivliostyle Viewerは自己ホストしない。ビルドしたWebPub（`publication.json`）を、公式の
[vivliostyle.org/viewer](https://vivliostyle.org/viewer/)に読み込ませるリンク方式を採る。

### ブランチ運用

執筆用ブランチ → PR（`pr-preview-action`のプレビューでWeb/PDF両方を確認）→ `main`（マージで
本番デプロイ）という2段階フロー。

## Consequences（この決定によって生じること）

- `vivliostyle.config.js`の`output`にWebPubとPDFの両方を定義する（`vivliostyle.config.js`参照）。
- GitHub Pagesの「Deploy from a branch」設定はWeb UIからの手動作業が必要（`README.md`の該当
  セクション参照）。
- `gh-pages`ブランチは、PRプレビュー（`pr-preview/pr-<番号>/`）と本番（ルート）が共存する。
  本番デプロイワークフローは`keep_files: true`でプレビュー分を消さないようにしている。
- 図版はソース（`.mmd`/`.drawio`）とレンダリング後のSVGの両方をリポジトリにコミットする運用になる
  （`docs/mermaid-to-svg.md`、`docs/drawio-to-svg.md`参照）。
