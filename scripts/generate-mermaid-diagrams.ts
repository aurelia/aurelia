import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const docsRoot = path.join(process.cwd(), "docs");
const mermaidRoot = path.join(docsRoot, "mermaid-src");
const imagesRoot = path.join(docsRoot, "images");

function convertDir(root: string) {
  for (const item of fs.readdirSync(root)) {
    const qualifiedPath = path.join(root, item);
    const stats = fs.statSync(qualifiedPath);
    if (!stats.isDirectory()) {
      const extName = path.extname(qualifiedPath);
      const fileName = path.basename(qualifiedPath, extName);
      if (extName !== ".mmd") { continue; }

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
