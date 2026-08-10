#!/usr/bin/env node
// assets/mermaid/**/*.mmd を mermaid-cli (mmdc) で SVG に変換し、
// 同じ相対パスで assets/images/ 以下に出力する一括変換スクリプト。
// 手順の詳細は docs/mermaid-to-svg.md を参照。
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, extname, basename } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC_DIR = join(ROOT, "assets", "mermaid");
const OUT_DIR = join(ROOT, "assets", "images");
const PUPPETEER_CONFIG = join(ROOT, "assets", "mermaid", "puppeteer-config.json");

function findMmdFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return findMmdFiles(full);
    if (extname(entry.name) === ".mmd") return [full];
    return [];
  });
}

function main() {
  let files;
  try {
    files = findMmdFiles(SRC_DIR);
  } catch {
    console.error(`変換対象が見つかりません: ${SRC_DIR} が存在しません`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(`変換対象の .mmd ファイルがありません（${SRC_DIR}）`);
    return;
  }

  for (const src of files) {
    const rel = relative(SRC_DIR, src);
    const outPath = join(OUT_DIR, dirname(rel), basename(rel, ".mmd") + ".svg");
    mkdirSync(dirname(outPath), { recursive: true });

    const args = ["-i", src, "-o", outPath, "-b", "transparent"];
    // root権限のコンテナ環境（Docker/CI等）ではChromiumのサンドボックスが
    // 起動できないことがあるため、puppeteer-config.jsonがあれば適用する。
    if (existsSync(PUPPETEER_CONFIG)) {
      args.push("-p", PUPPETEER_CONFIG);
    }
    try {
      execFileSync("mmdc", args, { stdio: "inherit" });
    } catch {
      // ローカルインストール未実施の場合は npx 経由にフォールバック
      execFileSync("npx", ["-y", "@mermaid-js/mermaid-cli", ...args], {
        stdio: "inherit",
      });
    }
    console.log(`generated: ${relative(ROOT, outPath)}`);
  }
}

main();
