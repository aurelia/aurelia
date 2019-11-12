const ts = require("typescript");

const source = `const {a, ...rest, c} = {}`;

const sourceFile = ts.createSourceFile(
  "",
  source,
  ts.ScriptTarget.ES2015,
);

function report(node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart()
  );
  console.log(
    `${sourceFile.fileName} (${line + 1},${character + 1})`
  );
}
console.log(sourceFile.kind);
sourceFile.forEachChild((node) => {
  report(node);
});
