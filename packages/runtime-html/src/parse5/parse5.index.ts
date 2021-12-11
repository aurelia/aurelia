import { TemplateCompiler } from "../template-compiler";
import { ITemplateCompiler } from "../renderer";
import { DI, IPlatform, Registration } from "@aurelia/kernel";
import { Node, Document, parse, TreeAdapter } from "parse5";
import * as treeAdapter from "./pars5-adapter";
import { ExpressionType, parseExpression } from '..';

// parseExpression('${foo.} ${bar}<p></p>', ExpressionType.Interpolation);/* ? */
parseExpression('${foo} ${bar.}<p></p>', ExpressionType.Interpolation);/* ? */

const container = DI.createContainer();

TemplateCompiler.register(container);
// Registration.singleton(IPlatform, new IPlatform())
const tempCompiler = container.get(ITemplateCompiler);
// const tempCompiler = new ITemplateCompiler();
// const template = parse(rawTemplate);
// template; /* ? */

function doParse5AndAureliaStuff() {
  const rawTemplate = "<template>${foo}</template>";
  const document = parse(rawTemplate, { treeAdapter });

  walkTree(document, treeAdapter, (node: Node | undefined) => {
    if (node == null) return;
    Registration.instance(IPlatform, { document: treeAdapter }).register(
      container
    );
    const justRawInputNode =
      // @ts-ignore
      node?.childNodes[1].parentNode?.childNodes[0].childNodes[0];
    const result = tempCompiler.compile(
      {
        name: "template",
        template: justRawInputNode,
        surrogates: [],
        instructions: [],
      },
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
