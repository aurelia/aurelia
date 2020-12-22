"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$JsxExpression = exports.$JsxSpreadAttribute = exports.$JsxAttributes = exports.$$jsxAttributeLikeList = exports.$JsxAttribute = exports.$JsxClosingFragment = exports.$JsxOpeningFragment = exports.$JsxClosingElement = exports.$JsxOpeningElement = exports.$JsxText = exports.$JsxFragment = exports.$JsxSelfClosingElement = exports.$$jsxTagNameExpression = exports.$JsxElement = exports.$$jsxChildList = void 0;
const typescript_1 = require("typescript");
const kernel_1 = require("@aurelia/kernel");
const _shared_js_1 = require("./_shared.js");
const expressions_js_1 = require("./expressions.js");
const literals_js_1 = require("./literals.js");
function $$jsxChildList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return kernel_1.emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        switch (nodes[i].kind) {
            case typescript_1.SyntaxKind.JsxText:
                $nodes[i] = new $JsxText(nodes[i], parent, ctx, i);
                break;
            case typescript_1.SyntaxKind.JsxExpression:
                $nodes[i] = new $JsxExpression(nodes[i], parent, ctx, i);
                break;
            case typescript_1.SyntaxKind.JsxElement:
                $nodes[i] = new $JsxElement(nodes[i], parent, ctx, i);
                break;
            case typescript_1.SyntaxKind.JsxSelfClosingElement:
                $nodes[i] = new $JsxSelfClosingElement(nodes[i], parent, ctx, i);
                break;
            case typescript_1.SyntaxKind.JsxFragment:
                $nodes[i] = new $JsxFragment(nodes[i], parent, ctx, i);
                break;
        }
    }
    return $nodes;
}
exports.$$jsxChildList = $$jsxChildList;
class $JsxElement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.JsxElement`) {
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
    get $kind() { return typescript_1.SyntaxKind.JsxElement; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.undefined; // TODO: implement this
    }
}
exports.$JsxElement = $JsxElement;
function $$jsxTagNameExpression(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.Identifier:
            return new expressions_js_1.$Identifier(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ThisKeyword:
            return new expressions_js_1.$ThisExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.PropertyAccessExpression:
            return new expressions_js_1.$PropertyAccessExpression(node, parent, ctx, idx);
        default:
            throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[node.kind]}.`);
    }
}
exports.$$jsxTagNameExpression = $$jsxTagNameExpression;
class $JsxSelfClosingElement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.JsxSelfClosingElement`) {
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
    get $kind() { return typescript_1.SyntaxKind.JsxSelfClosingElement; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.undefined; // TODO: implement this
    }
}
exports.$JsxSelfClosingElement = $JsxSelfClosingElement;
class $JsxFragment {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.JsxFragment`) {
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
    get $kind() { return typescript_1.SyntaxKind.JsxFragment; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.undefined; // TODO: implement this
    }
}
exports.$JsxFragment = $JsxFragment;
class $JsxText {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.JsxText`) {
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
    get $kind() { return typescript_1.SyntaxKind.JsxText; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$JsxText = $JsxText;
class $JsxOpeningElement {
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
    get $kind() { return typescript_1.SyntaxKind.JsxOpeningElement; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$JsxOpeningElement = $JsxOpeningElement;
class $JsxClosingElement {
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
    get $kind() { return typescript_1.SyntaxKind.JsxClosingElement; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$JsxClosingElement = $JsxClosingElement;
class $JsxOpeningFragment {
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
    get $kind() { return typescript_1.SyntaxKind.JsxOpeningFragment; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$JsxOpeningFragment = $JsxOpeningFragment;
class $JsxClosingFragment {
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
    get $kind() { return typescript_1.SyntaxKind.JsxClosingFragment; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$JsxClosingFragment = $JsxClosingFragment;
class $JsxAttribute {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.JsxAttribute`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        if (node.initializer === void 0) {
            this.$initializer = void 0;
        }
        else {
            if (node.initializer.kind === typescript_1.SyntaxKind.StringLiteral) {
                this.$initializer = new literals_js_1.$StringLiteral(node.initializer, this, ctx, -1);
            }
            else {
                this.$initializer = new $JsxExpression(node.initializer, this, ctx, -1);
            }
        }
    }
    get $kind() { return typescript_1.SyntaxKind.JsxAttribute; }
}
exports.$JsxAttribute = $JsxAttribute;
function $$jsxAttributeLikeList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return kernel_1.emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        switch (nodes[i].kind) {
            case typescript_1.SyntaxKind.JsxAttribute:
                $nodes[i] = new $JsxAttribute(nodes[i], parent, ctx, i);
                break;
            case typescript_1.SyntaxKind.JsxSpreadAttribute:
                $nodes[i] = new $JsxSpreadAttribute(nodes[i], parent, ctx, i);
                break;
        }
    }
    return $nodes;
}
exports.$$jsxAttributeLikeList = $$jsxAttributeLikeList;
class $JsxAttributes {
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
    get $kind() { return typescript_1.SyntaxKind.JsxAttributes; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$JsxAttributes = $JsxAttributes;
class $JsxSpreadAttribute {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.JsxSpreadAttribute`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.JsxSpreadAttribute; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$JsxSpreadAttribute = $JsxSpreadAttribute;
class $JsxExpression {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.JsxExpression`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.JsxExpression; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.empty; // TODO: implement this
    }
}
exports.$JsxExpression = $JsxExpression;
//# sourceMappingURL=jsx.js.map