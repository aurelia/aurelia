import { TemplateCompiler } from "../template-compiler";
import { ITemplateCompiler } from "../renderer";
import { DI, IPlatform, Registration } from "@aurelia/kernel";
import { Document, parse, TreeAdapter } from "parse5";
import * as parse5TreeAdapter from "./pars5-adapter";

const container = DI.createContainer();

TemplateCompiler.register(container);
// Registration.singleton(IPlatform, new IPlatform())
const tempCompiler = container.get(ITemplateCompiler);
// const tempCompiler = new ITemplateCompiler();
// const template = parse(rawTemplate);
// template; /* ? */

function doParse5AndAureliaStuff() {
  const rawTemplate = "<template>${foo}</template>";
  const document = parse(rawTemplate);

  walkTree(document, parse5TreeAdapter, (node) => {
    Registration.instance(IPlatform, { document: parse5TreeAdapter }).register(
      container
    );
    container.register(IPlatform, IPlatform);
    // node; /* ? */
    const result = tempCompiler.compile(
      { name: "", template: node, surrogates: [], instructions: [] },
      container,
      null
    );
    result; /* ? */
  });
}
doParse5AndAureliaStuff();

// type Handler = (node: Node | undefined) => void
function walkTree(
  document: Document,
  treeAdapter: TreeAdapter,
  handler: (node: Node | undefined) => void
) {
  for (
    let stack = treeAdapter.getChildNodes(document).slice();
    stack.length;

  ) {
    const node = stack.shift();
    if (node == null) return;
    const children = treeAdapter.getChildNodes(node);

    handler(node);

    if (children && children.length) {
      stack = children.concat(stack);
    }
  }
}
