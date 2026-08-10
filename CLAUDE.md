# CLAUDE.md

このファイルは、このリポジトリでClaude Code（および他のAIエージェント）が作業する際の指針です。

## プロジェクト概要

「ネットワーク入門テキスト（仮）」— Markdown原稿1本からWeb版とPDF版を同時生成する
Single Source Multi Output方式の技術書。詳細は [`README.md`](./README.md) を参照。
ビルドパイプライン・図版方針・ライセンス方針はADR-001に準拠している。

**著者**: 河野 崇（ローマ字: Takashi Kouno）。著作権表示・奥付など、著者名を出す箇所では
このローマ字表記（`Takashi Kouno`）をデフォルトとし、読者向けの日本語ページ（奥付、ライセンス
説明ページ）では「河野 崇（Takashi Kouno）」のように漢字を併記する。

## 開発コマンド

```bash
npm install              # 依存関係インストール（package-lock.jsonは非コミット。下記参照）
npm run build             # Web(WebPub) + PDF を両方ビルド（dist/配下）
npm run build:webpub      # Webのみ
npm run build:pdf         # PDFのみ
npm run preview           # Vivliostyle Viewerでプレビュー
npm run mermaid:build     # assets/mermaid/*.mmd を assets/images/*.svg に一括変換
```

- `package-lock.json`はコミットしない運用（セットアップ時の事情。詳細はREADMEの該当セクション参照）。
  CIも`npm ci`ではなく`npm install`を使う。ロックファイルをコミットする方針に変える場合は、
  `.gitignore`のエントリを外し、CIを`npm ci`に戻すこと。

## ディレクトリ構成の要点

- `manuscript/`: 章ごとのMarkdown原稿。ファイル名の連番＝掲載順（`vivliostyle.config.js`の
  コメントに詳細）。章末のHTMLコメント（「クラウドTips」「伏線回収」構成メモ）は執筆用の
  下書きメモであり、本文として表示されないことを確認しながら扱うこと。
- `theme/style.css`: Web/PDF共通のページスタイル。ライセンスの1行フッターもここ（`@page`ルール）。
- `assets/mermaid/` `assets/drawio/` `assets/images/`: 図版ソースとレンダリング済みSVG。
  変換手順は[`docs/mermaid-to-svg.md`](./docs/mermaid-to-svg.md)、
  [`docs/drawio-to-svg.md`](./docs/drawio-to-svg.md)。
- `site/index.html`: GitHub Pagesの入口ページ。Viewerは自己ホストせず、公式のVivliostyle Viewer
  （vivliostyle.org/viewer）に`webpub/publication.json`のURLを渡す方式。
- `.github/workflows/`: `pr-preview.yml`（PRごとに`gh-pages`ブランチの`pr-preview/pr-<番号>/`へ
  Web+PDFをデプロイ）、`deploy.yml`（mainマージ時に同ブランチのルートへ本番デプロイ、
  `keep_files: true`でpr-preview配下と共存）。

## ブランチ運用・セキュリティ設定

- `main`はRuleset保護済み: PR必須（承認数0＝セルフレビュー可）、force push禁止、
  `deploy-preview`ステータスチェック必須。直接pushはできない。
- 執筆用ブランチ → PR（`pr-preview-action`のプレビューでWeb/PDF両方確認）→ `main`マージで本番デプロイ、
  という2段階フロー。

## エージェント運用方針

詳細は [`.agents/`](./.agents/) 配下を参照（[`.agents/default.md`](./.agents/default.md)、
[`.agents/review.md`](./.agents/review.md)）。要点:

- **基本的にオートモードで実行する。** destructiveな操作や内容判断が要る事項のみ確認を挟む。
- **サブエージェントの利用を許可する。** 主な用途はレビュー工程（下記）。
- **重い作業・重要な作業ではFable 5 (`claude-fable-5`) の使用を許可する。** コストより品質を
  優先してよい場面という判断。
- **レビューはレビュー専用サブエージェント（[`.claude/agents/reviewer.md`](./.claude/agents/reviewer.md)）
  に責任をもってやらせる。** 2段階で呼ぶこと:
  1. `model: claude-sonnet-5` を指定した安価な第1パス
  2. デフォルトモデル（Fable 5、コスト事情があれば`claude-opus-5`にフォールバック）での最終パス。
     特にリポジトリ全体での語尾・文体の統一はこの最終パスで重点的に確認させる。
- 自己判断だけで「レビュー完了」とみなさず、`reviewer`エージェントの指摘に対応してからPRを
  Ready for reviewにすること。
