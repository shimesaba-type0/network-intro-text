// @ts-check
import { defineConfig } from "@vivliostyle/cli";

// 章ごとのMarkdownファイル分割方針:
//   manuscript/ 配下に「連番2桁-ファイル名.md」の形式でフラットに配置する。
//   連番は本の掲載順そのものを表し、Vivliostyleはこの配列の順序どおりに1冊として結合する。
//   00: 序章 / 01-12: 第1〜12章 / 13: 終章 / 90: ライセンス専用ページ / 99: 奥付
//   幕間（旧・05-幕間01.md、10-幕間02.md）は独立ファイルとせず、第5章・第10章それぞれの
//   冒頭リード文として統合済み（目次v3での決定）。
const manuscript = [
  "manuscript/00-序章.md",
  "manuscript/01-第01章.md",
  "manuscript/02-第02章.md",
  "manuscript/03-第03章.md",
  "manuscript/04-第04章.md",
  "manuscript/05-第05章.md",
  "manuscript/06-第06章.md",
  "manuscript/07-第07章.md",
  "manuscript/08-第08章.md",
  "manuscript/09-第09章.md",
  "manuscript/10-第10章.md",
  "manuscript/11-第11章.md",
  "manuscript/12-第12章.md",
  "manuscript/13-終章.md",
  "manuscript/90-license.md",
  "manuscript/99-colophon.md",
];

export default defineConfig({
  title: "ネットワーク基礎再入門",
  author: "Takashi Kouno",
  language: "ja",
  size: "A5",
  theme: "./theme/style.css",
  entry: manuscript,
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
