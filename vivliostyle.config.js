// @ts-check
import { defineConfig } from "@vivliostyle/cli";

// 章ごとのMarkdownファイル分割方針:
//   manuscript/ 配下に「連番2桁-ファイル名.md」の形式でフラットに配置する。
//   連番は本の掲載順そのものを表し、Vivliostyleはこの配列の順序どおりに1冊として結合する。
//   00: はじめに / 01: 序章 / 02-13: 第1〜12章 / 14: 終章 / 90: ライセンス専用ページ / 99: 奥付
//   「この本の読み方」（5種の箱の凡例）は序章（物語本文）と切り離し、「はじめに」に配置している
//   （序章は物語、はじめには読み方の説明、という役割の違いを明確にするため）。
//   幕間（旧・05-幕間01.md、10-幕間02.md）は独立ファイルとせず、第5章・第10章それぞれの
//   冒頭リード文として統合済み（目次v3での決定）。
const manuscript = [
  "manuscript/00-はじめに.md",
  "manuscript/01-序章.md",
  "manuscript/02-第01章.md",
  "manuscript/03-第02章.md",
  "manuscript/04-第03章.md",
  "manuscript/05-第04章.md",
  "manuscript/06-第05章.md",
  "manuscript/07-第06章.md",
  "manuscript/08-第07章.md",
  "manuscript/09-第08章.md",
  "manuscript/10-第09章.md",
  "manuscript/11-第10章.md",
  "manuscript/12-第11章.md",
  "manuscript/13-第12章.md",
  "manuscript/14-終章.md",
  "manuscript/90-license.md",
  "manuscript/99-colophon.md",
];

// 表紙（Issue #10, manuscript/表紙.md）は、掲載順の先頭に固定で差し込む（manuscript配列側の
// 連番は変更しない）。Vivliostyle CLIの `rel: "cover"` エントリは画像1枚をラップする専用機能
// （coverImageSrcが必須で、独自CSSのHTMLコンテンツを差し込めない）のため、ここでは使わず、
// 通常の原稿エントリとして先頭に置き、theme/style.cssの`.cover` / `@page cover`で
// フルブリードのレイアウトを実現している。
// `{ rel: "contents" }` を表紙の直後に明示的に置いているのは、`toc: true` のときVivliostyle
// CLIが自動生成する目次エントリを配列の先頭に無条件でunshiftしてしまい、表紙より前に
// 目次が来てしまう（実測で確認）挙動を避けるため。自分でrel:"contents"エントリを
// 用意しておくと、その自動unshiftは行われず、この位置がそのまま採用される。
const entry = ["manuscript/表紙.md", { rel: "contents" }, ...manuscript];

export default defineConfig({
  title: "ネットワーク基礎再入門",
  author: "Takashi Kouno",
  language: "ja",
  size: "A5",
  theme: "./theme/style.css",
  entry,
  entryContext: ".",
  toc: true,
  tocTitle: "目次",
  workspaceDir: ".vivliostyle",
  // entryContext がリポジトリルートのため、デフォルトでは画像拡張子を持つファイルが
  // リポジトリ全体からビルド成果物にコピーされてしまう。docs/ 配下は原稿ではなく
  // ドキュメント（Mermaid変換手順のサンプル等）なので、Web/PDFの成果物には含めない。
  copyAsset: {
    excludes: ["docs/**"],
    // .txt はデフォルトのアセット拡張子に含まれないため、明示的に含める。
    // theme/fonts/*.woff2（HackGen Console NF, SIL OFL 1.1）を配布する際に、
    // ライセンス全文を同じ場所に同梱しておくため。
    includes: ["theme/fonts/LICENSE-HackGen.txt"],
  },
  output: [
    {
      path: "./dist/webpub",
      format: "webpub",
    },
    {
      path: "./dist/book.pdf",
      format: "pdf",
    },
  ],
});
