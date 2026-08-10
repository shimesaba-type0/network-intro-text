# network-intro-text

ネットワーク入門テキスト（仮）― Markdown原稿1本から Web版 と PDF版 を同時生成する
Single Source Multi Output 方式の技術書プロジェクトです。

## プロジェクト概要

- **原稿フォーマット**: Markdown（[Vivliostyle Flavored Markdown](https://docs.vivliostyle.org/)）
- **レンダラー**: [Vivliostyle CLI](https://vivliostyle.org/) — 1つの原稿からWeb(HTML/WebPub)とPDFを同時生成する
- **構成**: 序章 + 第1〜12章（幕間2箇所を含む）+ 終章
- **図版**: 時系列・関係性を表す図はMermaid、配置に意味を持たせたい図はdraw.ioで作成し、
  いずれも事前にSVGへレンダリングしてから原稿に埋め込む（[docs/mermaid-to-svg.md](./docs/mermaid-to-svg.md)、
  [docs/drawio-to-svg.md](./docs/drawio-to-svg.md)を参照）
- **ライセンス**: [CC BY-NC-ND 4.0](./LICENSE.md)（本文・図版などのコンテンツが対象）

これらの方針の背景・決定理由は
[ADR-001: Web/PDF公開パイプラインおよび図版制作方針](./docs/adr/ADR-001-web-pdf-publishing-pipeline.md)
にまとめています。

## 想定読者

ネットワークの基礎を、体系立てて・実務やクラウド活用にもつながる形で学びたい入門者を想定しています。
各章末には、内容に関連するクラウドサービスの豆知識コラム（「クラウドTips」）を挟む構成になっています。

## ディレクトリ構成

```
.
├── manuscript/            原稿（Markdown、章ごとに1ファイル）
│   ├── 00-序章.md
│   ├── 01-第01章.md 〜 14-第12章.md（幕間2箇所を含む）
│   ├── 15-終章.md
│   ├── 90-license.md      ライセンス専用ページ（Web/PDF共通）
│   └── 99-colophon.md     奥付（Web/PDF共通、末尾）
├── theme/style.css        Vivliostyleテーマ（ページ設定・フッターのライセンス表記など）
├── theme/fonts/           コードブロック用フォント（HackGen Console NF、同梱理由は下記参照）
├── assets/
│   ├── mermaid/           Mermaid図のソース（*.mmd）
│   ├── drawio/            draw.io図のソース（*.drawio）
│   └── images/            レンダリング済みSVG（原稿から参照する成果物）
├── site/index.html        GitHub Pages用の入口ページ（Vivliostyle Viewerへのリンクを生成）
├── scripts/build-mermaid.mjs  Mermaid→SVG一括変換スクリプト
├── docs/                  執筆・ビルド手順のドキュメント
├── vivliostyle.config.js  Vivliostyleのビルド設定（Web/PDF出力を定義）
└── .github/workflows/     PRプレビュー用・本番デプロイ用のCIワークフロー
```

原稿ファイルの連番は、そのまま本の掲載順を表します。幕間の挿入位置は暫定
（`vivliostyle.config.js`のコメントを参照）で、確定済みの目次に合わせて調整してください。

## ビルド方法

Node.js 20以上を推奨します。

```bash
npm install

# Web(WebPub) + PDF を両方ビルド（dist/webpub, dist/book.pdf に出力）
npm run build

# Web(WebPub)のみ
npm run build:webpub

# PDFのみ
npm run build:pdf

# ブラウザでプレビュー（Vivliostyle Viewerが立ち上がる）
npm run preview
```

図版の変換（Mermaid → SVG）は以下（詳細は [docs/mermaid-to-svg.md](./docs/mermaid-to-svg.md)）。

```bash
npm run mermaid:build
```

### Web版の閲覧方法について

`npm run build:webpub` で生成される `dist/webpub/` は、ページ送りのない素のHTML/JSON
（WebPub）です。これ自体はViewerを内蔵していません。
[ADR-001](./docs/adr/ADR-001-web-pdf-publishing-pipeline.md)の方針により、このリポジトリでは
Viewerを自己ホストせず、公式の [Vivliostyle Viewer](https://vivliostyle.org/viewer/) に
WebPubのURL（`publication.json`）を読み込ませる方式を採ります。`site/index.html` が、
デプロイ後のWebPubへの絶対URLから自動的にViewerへのリンクを組み立てます。

## デプロイ・ブランチ運用

1. 執筆用ブランチで原稿を更新する
2. `main`へのPull Requestを作成する → `.github/workflows/pr-preview.yml` が
   Web版・PDF版の両方をビルドし、`gh-pages`ブランチの `pr-preview/pr-<番号>/` にプレビューを
   デプロイする（PRにプレビューリンクがコメントされる）
3. プレビューでWeb版・PDF版の両方を確認してから`main`にマージする
4. マージすると `.github/workflows/deploy.yml` が本番ビルドを行い、`gh-pages`ブランチのルートに
   本番デプロイする

GitHub Pagesのデプロイソースは **「Deploy from a branch」**（`gh-pages` / `/ (root)`）を選択して
ください。`pr-preview-action`が「GitHub Actions」デプロイ方式と非互換のためです。

## ライセンス表記について

本文・図版などのコンテンツは CC BY-NC-ND 4.0 の下で提供されます。3階層で表記しています。

1. **Web/PDF共通フッター**（全ページ）: `theme/style.css` の `@page` ルールで、
   `© Takashi Kouno ・ CC BY-NC-ND 4.0` の1行 + legalcodeへの参照をWeb/PDF共通のページフッターとして表示
2. **専用ページ**（Web/PDF共通）: [`manuscript/90-license.md`](./manuscript/90-license.md) に
   条件のかみ砕いた説明を掲載
3. **奥付**（Web/PDF共通、末尾ページ）: [`manuscript/99-colophon.md`](./manuscript/99-colophon.md)。
   `vivliostyle.config.js`の`manuscript`配列はWeb/PDF共通の単一エントリなので、`90-license.md`と
   同様にWeb版にも含まれる（PDF限定のページではない）

リポジトリ全体のライセンス全文（CC BY-NC-ND 4.0の公式条文＋日本語でのかみ砕いた説明）は
[`LICENSE.md`](./LICENSE.md) を参照してください。

## フォントについて

コードブロック（`pre`/`code`）には [HackGen Console NF](https://github.com/yuru7/HackGen) を使用しています。
CI・Viewerの環境にインストールされているかに依存しないよう（CJKフォントの件と同じ理由。上記Issue #5参照）、
WOFF2ファイルを`theme/fonts/`に同梱し`@font-face`で読み込んでいます。SIL Open Font License 1.1で提供されており、
ライセンス全文は[`theme/fonts/LICENSE-HackGen.txt`](./theme/fonts/LICENSE-HackGen.txt)に同梱しています。
本文（見出し・地の文）のフォントはOS/Viewer側のNoto Sans/Serif JP等に委ねており、同梱していません。

同梱しているWOFF2は、[公式リリース v2.10.0](https://github.com/yuru7/HackGen/releases/tag/v2.10.0)の
TTF（`HackGenConsoleNF-Regular.ttf`/`-Bold.ttf`）をグリフ・ヒンティングとも無改変のままフォーマット変換
（TTF→WOFF2）しただけのものです。

## GitHub側で手動設定が必要な項目（Claude Codeでは実行不可）

以下はGitHubのWeb UIから行う必要があり、このセットアップでは未設定です。

- **GitHub Pagesのデプロイソース**を「Deploy from a branch」（`gh-pages` / `/ (root)`）に設定する
  （Settings → Pages）。`gh-pages`ブランチは、初回のPRプレビューまたは本番デプロイのワークフロー実行後に
  自動作成されます。
- **Aboutのtopicsタグ**を設定する: `network`, `textbook`, シリーズ共通タグ（例: `takashi-text-series`）
