import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { createHash } from "crypto";

interface MermaidSourceHashItem {
  relativePath: string;
  hash: string;
}

const docsRoot = path.join(process.cwd(), "docs");
const mermaidRoot = path.join(docsRoot, "mermaid-src");
const imagesRoot = path.join(docsRoot, "images");

const cacheFile = ".mermaidcache";
const cachePath = path.join(mermaidRoot, cacheFile);
let mermaidCache: MermaidSourceHashItem[];
if (!fs.existsSync(cachePath)) {
  fs.writeFileSync(cachePath, JSON.stringify(mermaidCache = []));
} else {
  mermaidCache = JSON.parse(fs.readFileSync(cachePath, "utf8")) as MermaidSourceHashItem[];
}

function convertDir(root: string) {
  for (const item of fs.readdirSync(root)) {
    const qualifiedPath = path.join(root, item);

    if (!fs.statSync(qualifiedPath).isDirectory()) {

      const extName = path.extname(qualifiedPath);
      const fileName = path.basename(qualifiedPath, extName);
      if (extName !== ".mmd") { continue; }

      const relativePath = path.relative(mermaidRoot, qualifiedPath);

      let hasChange = true;
      const hash = createHash('sha256').update(fs.readFileSync(qualifiedPath, "utf8")).digest("base64");

      const cacheItem = mermaidCache.find((i) => i.relativePath === relativePath);
      if (cacheItem === void 0) {
        mermaidCache.push({ relativePath, hash });
      } else {
        hasChange = hash !== cacheItem.hash;
        cacheItem.hash = hash;
      }
      if (!hasChange) { continue; }

      const relativeSrcPath = path.relative(mermaidRoot, root);
      const outputDir = path.resolve(imagesRoot, relativeSrcPath);
      fs.mkdirSync(outputDir, { recursive: true });
      execSync(`mmdc -i "${qualifiedPath}" -o "${path.join(outputDir, `${fileName}.svg`)}"`);
    } else {
      convertDir(qualifiedPath);
    }
  }
}
convertDir(mermaidRoot);
fs.writeFileSync(cachePath, JSON.stringify(mermaidCache));
