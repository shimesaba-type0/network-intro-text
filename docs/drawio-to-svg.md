# draw.io図をSVGに変換する手順

[ADR-001](./adr/ADR-001-web-pdf-publishing-pipeline.md)に基づき、配置（レイアウト）そのものに意味を持たせたい図（ネットワーク構成図など）は
draw.io（diagrams.net）で作成し、Mermaid図と同様に**事前にSVGへレンダリングしてから**
Markdown原稿に埋め込む。使い分けの目安は [`mermaid-to-svg.md`](./mermaid-to-svg.md) を参照。

## ディレクトリ構成

```
assets/
  drawio/    … draw.ioのソースファイル（*.drawio）
  images/    … レンダリング済みSVG（Mermaid由来のものと同じ場所に置く）
```

## 1. 図を作成する

[draw.io（diagrams.net）](https://app.diagrams.net/) のデスクトップアプリ、またはブラウザ版で作成し、
`assets/drawio/` 配下に `.drawio` 形式で保存する。

## 2. SVGへエクスポートする

### GUIから（推奨・確実）

draw.ioアプリのメニューから `File > Export as > SVG...` を選び、以下を確認してエクスポートする。

- **Transparent Background** を有効にする（Mermaid同様、背景を透過にする）
- 出力先を `assets/images/` 配下、`.drawio` と対応するファイル名にする
  （例: `assets/drawio/05-network-topology.drawio` → `assets/images/05-network-topology.svg`）

### CLIから（一括変換・自動化する場合）

draw.io Desktopにはコマンドライン変換機能もある（環境にインストール済みの場合）。

```bash
drawio --export --format svg --transparent \
  --output assets/images/05-network-topology.svg \
  assets/drawio/05-network-topology.drawio
```

CI環境でdraw.io CLIを常設するのはコストが高いため、このリポジトリでは**GUIでのエクスポートを基本**とし、
生成済みのSVGをコミットする運用とする（Mermaidと同じ考え方）。

## 3. Markdown原稿への埋め込み

```markdown
![ネットワーク構成図](../assets/images/05-network-topology.svg)
```

## 4. 運用ルール

- `.drawio`（ソース）と `.svg`（生成物）は両方ともGitにコミットする。
- 図を修正したら、必ず再エクスポートして `.drawio` と `.svg` をセットでコミットする。
- ファイル名は原稿内での用途がわかるように、章番号などを接頭辞に付ける（Mermaidと同じ命名規則）。

### 例外: `.drawio`ソースを持たないSVG

`assets/images/00-*.svg`（序章のネットワーク模式図。単体PC、ダムハブ接続、トークンリング接続）は、
draw.ioのGUI/CLIが使えない環境で作成したため、上記フローに従わず**SVGを直接手書きしている**。
対応する`.drawio`ソースは存在しない。図を修正する際は、SVGのソースコードを直接編集すること。
