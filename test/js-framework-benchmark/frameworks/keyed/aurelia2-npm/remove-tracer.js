const fs = require("fs").promises;
const path = require("path");

async function* walk(dir) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const pathToFile = path.join(dir, file);
    const stat = await fs.stat(pathToFile);
    if (stat.isFile()) {
      yield pathToFile;
    } else if (stat.isDirectory()) {
      yield* walk(pathToFile);
    }
  }
}

(async function() {
  const aurelia = path.resolve(__dirname, "node_modules", "@aurelia");

  for await (const file of walk(aurelia)) {
    if (file.endsWith(".js")) {
      const content = await fs.readFile(file, { encoding: "utf8" });
      const newContent = content.replace(/ *if \(Tracer\.enabled\).*\n.*\n.*/g, "");
      await fs.writeFile(file, newContent);
    }
  }
})();
