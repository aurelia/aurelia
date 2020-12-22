import { SyntaxKind, } from 'typescript';
import { emptyArray, } from '@aurelia/kernel';
import { $identifier, $assignmentExpression, $i, } from './_shared.js';
import { $Identifier, $PropertyAccessExpression, $ThisExpression, } from './expressions.js';
import { $StringLiteral, } from './literals.js';
export function $$jsxChildList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        switch (nodes[i].kind) {
            case SyntaxKind.JsxText:
                $nodes[i] = new $JsxText(nodes[i], parent, ctx, i);
                break;
            case SyntaxKind.JsxExpression:
                $nodes[i] = new $JsxExpression(nodes[i], parent, ctx, i);
                break;
            case SyntaxKind.JsxElement:
                $nodes[i] = new $JsxElement(nodes[i], parent, ctx, i);
                break;
            case SyntaxKind.JsxSelfClosingElement:
                $nodes[i] = new $JsxSelfClosingElement(nodes[i], parent, ctx, i);
                break;
            case SyntaxKind.JsxFragment:
                $nodes[i] = new $JsxFragment(nodes[i], parent, ctx, i);
                break;
        }
    }
    return $nodes;
}
export class $JsxElement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.JsxElement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$openingElement = new $JsxOpeningElement(node.openingElement, this, ctx);
        this.$children = $$jsxChildList(node.children, this, ctx);
        this.$closingElement = new $JsxClosingElement(node.closingElement, this, ctx);
    }
    get $kind() { return SyntaxKind.JsxElement; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.undefined; // TODO: implement this
    }
}
export function $$jsxTagNameExpression(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.Identifier:
            return new $Identifier(node, parent, ctx, idx);
        case SyntaxKind.ThisKeyword:
            return new $ThisExpression(node, parent, ctx, idx);
        case SyntaxKind.PropertyAccessExpression:
            return new $PropertyAccessExpression(node, parent, ctx, idx);
        default:
            throw new Error(`Unexpected syntax node: ${SyntaxKind[node.kind]}.`);
    }
}
export class $JsxSelfClosingElement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.JsxSelfClosingElement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx, -1);
        this.$attributes = new $JsxAttributes(node.attributes, this, ctx);
    }
    get $kind() { return SyntaxKind.JsxSelfClosingElement; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.undefined; // TODO: implement this
    }
}
export class $JsxFragment {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.JsxFragment`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$openingFragment = new $JsxOpeningFragment(node.openingFragment, this, ctx);
        this.$children = $$jsxChildList(node.children, this, ctx);
        this.$closingFragment = new $JsxClosingFragment(node.closingFragment, this, ctx);
    }
    get $kind() { return SyntaxKind.JsxFragment; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.undefined; // TODO: implement this
    }
}
export class $JsxText {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.JsxText`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
    }
    get $kind() { return SyntaxKind.JsxText; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
export class $JsxOpeningElement {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.JsxOpeningElement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx, -1);
        this.$attributes = new $JsxAttributes(node.attributes, this, ctx);
    }
    get $kind() { return SyntaxKind.JsxOpeningElement; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
export class $JsxClosingElement {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.JsxClosingElement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx, -1);
    }
    get $kind() { return SyntaxKind.JsxClosingElement; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
export class $JsxOpeningFragment {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.JsxOpeningFragment`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
    }
    get $kind() { return SyntaxKind.JsxOpeningFragment; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
export class $JsxClosingFragment {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.JsxClosingFragment`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
    }
    get $kind() { return SyntaxKind.JsxClosingFragment; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
export class $JsxAttribute {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.JsxAttribute`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$name = $identifier(node.name, this, ctx, -1);
        if (node.initializer === void 0) {
            this.$initializer = void 0;
        }
        else {
            if (node.initializer.kind === SyntaxKind.StringLiteral) {
                this.$initializer = new $StringLiteral(node.initializer, this, ctx, -1);
            }
            else {
                this.$initializer = new $JsxExpression(node.initializer, this, ctx, -1);
            }
        }
    }
    get $kind() { return SyntaxKind.JsxAttribute; }
}
export function $$jsxAttributeLikeList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        switch (nodes[i].kind) {
            case SyntaxKind.JsxAttribute:
                $nodes[i] = new $JsxAttribute(nodes[i], parent, ctx, i);
                break;
            case SyntaxKind.JsxSpreadAttribute:
                $nodes[i] = new $JsxSpreadAttribute(nodes[i], parent, ctx, i);
                break;
        }
    }
    return $nodes;
}
export class $JsxAttributes {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.JsxAttributes`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$properties = $$jsxAttributeLikeList(node.properties, this, ctx);
    }
    get $kind() { return SyntaxKind.JsxAttributes; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
export class $JsxSpreadAttribute {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.JsxSpreadAttribute`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = $assignmentExpression(node.expression, this, ctx, -1);
    }
    get $kind() { return SyntaxKind.JsxSpreadAttribute; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
export class $JsxExpression {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.JsxExpression`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = $assignmentExpression(node.expression, this, ctx, -1);
    }
    get $kind() { return SyntaxKind.JsxExpression; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
//# sourceMappingURL=jsx.js.map