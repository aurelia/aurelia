/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ILogger, resolveAll, onResolve } from '../../../kernel/dist/native-modules/index.js';
import { CustomElement } from '../../../runtime-html/dist/native-modules/index.js';
import { IRouter } from './router.js';
import { ViewportInstructionTree, ViewportInstruction } from './instructions.js';
import { RouteDefinition } from './route-definition.js';
import { ViewportRequest } from './viewport-agent.js';
import { RouteExpression } from './route-expression.js';
let nodeId = 0;
export class RouteNode {
    constructor(
    /** @internal */
    id, 
    /**
     * The original configured path pattern that was matched, or the component name if it was resolved via direct routing.
     */
    path, 
    /**
     * If one or more redirects have occurred, then this is the final path match, in all other cases this is identical to `path`
     */
    finalPath, 
    /**
     * The `RouteContext` associated with this route.
     *
     * Child route components will be created by this context.
     *
     * Viewports that live underneath the component associated with this route, will be registered to this context.
     */
    context, 
    /** @internal */
    originalInstruction, 
    /** Can only be `null` for the composition root */
    instruction, params, queryParams, fragment, data, 
    /**
     * The viewport is always `null` for the root `RouteNode`.
     *
     * NOTE: It might make sense to have a `null` viewport mean other things as well (such as, don't load this component)
     * but that is currently not a deliberately implemented feature and we might want to explicitly validate against it
     * if we decide not to implement that.
     */
    viewport, title, component, append, children, 
    /**
     * Not-yet-resolved viewport instructions.
     *
     * Instructions need an `IRouteContext` to be resolved into complete `RouteNode`s.
     *
     * Resolved instructions are removed from this array, such that a `RouteNode` can be considered
     * "fully resolved" when it has `residue.length === 0` and `children.length >= 0`
     */
    residue) {
        this.id = id;
        this.path = path;
        this.finalPath = finalPath;
        this.context = context;
        this.originalInstruction = originalInstruction;
        this.instruction = instruction;
        this.params = params;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.data = data;
        this.viewport = viewport;
        this.title = title;
        this.component = component;
        this.append = append;
        this.children = children;
        this.residue = residue;
        /** @internal */
        this.version = 1;
        this.originalInstruction = instruction;
    }
    get root() {
        return this.tree.root;
    }
    static create(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return new RouteNode(
        /*          id */ ++nodeId, 
        /*        path */ input.path, 
        /*   finalPath */ input.finalPath, 
        /*     context */ input.context, 
        /* originalIns */ input.instruction, 
        /* instruction */ input.instruction, (_a = 
        /*      params */ input.params) !== null && _a !== void 0 ? _a : {}, (_b = 
        /* queryParams */ input.queryParams) !== null && _b !== void 0 ? _b : Object.freeze(new URLSearchParams()), (_c = 
        /*    fragment */ input.fragment) !== null && _c !== void 0 ? _c : null, (_d = 
        /*        data */ input.data) !== null && _d !== void 0 ? _d : {}, (_e = 
        /*    viewport */ input.viewport) !== null && _e !== void 0 ? _e : null, (_f = 
        /*       title */ input.title) !== null && _f !== void 0 ? _f : null, 
        /*   component */ input.component, 
        /*      append */ input.append, (_g = 
        /*    children */ input.children) !== null && _g !== void 0 ? _g : [], (_h = 
        /*     residue */ input.residue) !== null && _h !== void 0 ? _h : []);
    }
    contains(instructions) {
        var _a, _b;
        if (this.context === instructions.options.context) {
            const nodeChildren = this.children;
            const instructionChildren = instructions.children;
            for (let i = 0, ii = nodeChildren.length; i < ii; ++i) {
                for (let j = 0, jj = instructionChildren.length; j < jj; ++j) {
                    if (i + j < ii && ((_b = (_a = nodeChildren[i + j].instruction) === null || _a === void 0 ? void 0 : _a.contains(instructionChildren[j])) !== null && _b !== void 0 ? _b : false)) {
                        if (j + 1 === jj) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        }
        return this.children.some(function (x) {
            return x.contains(instructions);
        });
    }
    appendChild(child) {
        this.children.push(child);
        child.setTree(this.tree);
    }
    appendChildren(...children) {
        for (const child of children) {
            this.appendChild(child);
        }
    }
    clearChildren() {
        for (const c of this.children) {
            c.clearChildren();
            c.context.vpa.cancelUpdate();
        }
        this.children.length = 0;
    }
    getTitle(separator) {
        const titleParts = [
            ...this.children.map(x => x.getTitle(separator)),
            this.getTitlePart(),
        ].filter(x => x !== null);
        if (titleParts.length === 0) {
            return null;
        }
        return titleParts.join(separator);
    }
    getTitlePart() {
        if (typeof this.title === 'function') {
            return this.title.call(void 0, this);
        }
        return this.title;
    }
    computeAbsolutePath() {
        if (this.context.isRoot) {
            return '';
        }
        const parentPath = this.context.parent.node.computeAbsolutePath();
        const thisPath = this.instruction.toUrlComponent(false);
        if (parentPath.length > 0) {
            if (thisPath.length > 0) {
                return [parentPath, thisPath].join('/');
            }
            return parentPath;
        }
        return thisPath;
    }
    /** @internal */
    setTree(tree) {
        this.tree = tree;
        for (const child of this.children) {
            child.setTree(tree);
        }
    }
    /** @internal */
    finalizeInstruction() {
        const children = this.children.map(x => x.finalizeInstruction());
        const instruction = this.instruction.clone();
        instruction.children.splice(0, instruction.children.length, ...children);
        return this.instruction = instruction;
    }
    /** @internal */
    clone() {
        const clone = new RouteNode(this.id, this.path, this.finalPath, this.context, this.originalInstruction, this.instruction, { ...this.params }, { ...this.queryParams }, this.fragment, { ...this.data }, this.viewport, this.title, this.component, this.append, this.children.map(x => x.clone()), [...this.residue]);
        clone.version = this.version + 1;
        if (clone.context.node === this) {
            clone.context.node = clone;
        }
        return clone;
    }
    toString() {
        var _a, _b, _c, _d, _e;
        const props = [];
        const component = (_c = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.definition.component) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '';
        if (component.length > 0) {
            props.push(`c:'${component}'`);
        }
        const path = (_e = (_d = this.context) === null || _d === void 0 ? void 0 : _d.definition.config.path) !== null && _e !== void 0 ? _e : '';
        if (path.length > 0) {
            props.push(`path:'${path}'`);
        }
        if (this.children.length > 0) {
            props.push(`children:[${this.children.map(String).join(',')}]`);
        }
        if (this.residue.length > 0) {
            props.push(`residue:${this.residue.map(function (r) {
                if (typeof r === 'string') {
                    return `'${r}'`;
                }
                return String(r);
            }).join(',')}`);
        }
        return `RN(ctx:'${this.context.friendlyPath}',${props.join(',')})`;
    }
}
export class RouteTree {
    constructor(options, queryParams, fragment, root) {
        this.options = options;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.root = root;
    }
    contains(instructions) {
        return this.root.contains(instructions);
    }
    clone() {
        const clone = new RouteTree(this.options.clone(), { ...this.queryParams }, this.fragment, this.root.clone());
        clone.root.setTree(this);
        return clone;
    }
    finalizeInstructions() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map(x => x.finalizeInstruction()), this.queryParams, this.fragment);
    }
    toString() {
        return this.root.toString();
    }
}
/**
 * Returns a stateful `RouteTree` based on the provided context and transition.
 *
 * This expression will always start from the root context and build a new complete tree, up until (and including)
 * the context that was passed-in.
 *
 * If there are any additional child navigations to be resolved lazily, those will be added to the leaf
 * `RouteNode`s `residue` property which is then resolved by the router after the leaf node is loaded.
 *
 * This means that a `RouteTree` can (and often will) be built incrementally during the loading process.
 */
export function updateRouteTree(rt, vit, ctx) {
    const log = ctx.get(ILogger).scopeTo('RouteTree');
    // The root of the routing tree is always the CompositionRoot of the Aurelia app.
    // From a routing perspective it's simply a "marker": it does not need to be loaded,
    // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
    // other than by reading (deps, optional route config, owned viewports) from it.
    const rootCtx = ctx.root;
    rt.options = vit.options;
    rt.queryParams = vit.queryParams;
    rt.fragment = vit.fragment;
    if (vit.isAbsolute) {
        ctx = rootCtx;
    }
    if (ctx === rootCtx) {
        rt.root.setTree(rt);
        rootCtx.node = rt.root;
    }
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${suffix}`, rootCtx, rt, vit);
    return onResolve(ctx.resolved, () => {
        return updateNode(log, vit, ctx, rootCtx.node);
    });
}
function updateNode(log, vit, ctx, node) {
    log.trace(`updateNode(ctx:%s,node:%s)`, ctx, node);
    node.queryParams = vit.queryParams;
    node.fragment = vit.fragment;
    let maybePromise;
    if (!node.context.isRoot) {
        // TODO(fkleuver): store `options` on every individual instruction instead of just on the tree, or split it up etc? this needs a bit of cleaning up
        maybePromise = node.context.vpa.scheduleUpdate(node.tree.options, node);
    }
    else {
        maybePromise = void 0;
    }
    return onResolve(maybePromise, () => {
        if (node.context === ctx) {
            // Do an in-place update (remove children and re-add them by compiling the instructions into nodes)
            node.clearChildren();
            return resolveAll(...vit.children.map(vi => {
                return createAndAppendNodes(log, node, vi, node.tree.options.append || vi.append);
            }));
        }
        // Drill down until we're at the node whose context matches the provided navigation context
        return resolveAll(...node.children.map(child => {
            return updateNode(log, vit, ctx, child);
        }));
    });
}
export function processResidue(node) {
    const ctx = node.context;
    const log = ctx.get(ILogger).scopeTo('RouteTree');
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`processResidue(node:%s)${suffix}`, node);
    return onResolve(ctx.resolved, () => {
        return resolveAll(...node.residue.splice(0).map(vi => {
            return createAndAppendNodes(log, node, vi, node.append);
        }), ...ctx.getAvailableViewportAgents('static').map(vpa => {
            const defaultInstruction = ViewportInstruction.create(vpa.viewport.default);
            return createAndAppendNodes(log, node, defaultInstruction, node.append);
        }));
    });
}
export function getDynamicChildren(node) {
    const ctx = node.context;
    const log = ctx.get(ILogger).scopeTo('RouteTree');
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`getDynamicChildren(node:%s)${suffix}`, node);
    return onResolve(ctx.resolved, () => {
        const existingChildren = node.children.slice();
        return onResolve(resolveAll(...node.residue.splice(0).map(vi => {
            return createAndAppendNodes(log, node, vi, node.append);
        }), ...ctx.getAvailableViewportAgents('dynamic').map(vpa => {
            const defaultInstruction = ViewportInstruction.create(vpa.viewport.default);
            return createAndAppendNodes(log, node, defaultInstruction, node.append);
        })), () => {
            return node.children.filter(x => !existingChildren.includes(x));
        });
    });
}
export function createAndAppendNodes(log, node, vi, append) {
    var _a, _b;
    log.trace(`createAndAppendNodes(node:%s,vi:%s,append:${append})`, node, vi);
    switch (vi.component.type) {
        case 0 /* string */: {
            switch (vi.component.value) {
                case '..':
                    // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
                    node.clearChildren();
                    node = (_b = (_a = node.context.parent) === null || _a === void 0 ? void 0 : _a.node) !== null && _b !== void 0 ? _b : node;
                // falls through
                case '.':
                    return resolveAll(...vi.children.map(childVI => {
                        return createAndAppendNodes(log, node, childVI, childVI.append);
                    }));
                default: {
                    const childNode = createNode(log, node, vi, append);
                    if (childNode === null) {
                        return;
                    }
                    return appendNode(log, node, childNode);
                }
            }
        }
        case 4 /* IRouteViewModel */:
        case 2 /* CustomElementDefinition */: {
            const routeDef = RouteDefinition.resolve(vi.component.value);
            const childNode = createDirectNode(log, node, vi, append, routeDef.component);
            return appendNode(log, node, childNode);
        }
    }
}
function createNode(log, node, vi, append) {
    const ctx = node.context;
    let collapse = 0;
    let path = vi.component.value;
    let cur = vi;
    while (cur.children.length === 1) {
        cur = cur.children[0];
        if (cur.component.type === 0 /* string */) {
            ++collapse;
            path = `${path}/${cur.component.value}`;
        }
        else {
            break;
        }
    }
    const rr = ctx.recognize(path);
    if (rr === null) {
        const name = vi.component.value;
        const ced = ctx.find(CustomElement, name);
        switch (node.tree.options.routingMode) {
            case 'configured-only':
                if (ced === null) {
                    if (name === '') {
                        // TODO: maybe throw here instead? Do we want to force the empty route to always be configured?
                        return null;
                    }
                    throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${name}' to the routes list of the route decorator of '${ctx.component.name}'?`);
                }
                throw new Error(`'${name}' did not match any configured route, but it does match a registered component name at '${ctx.friendlyPath}' - did you forget to add a @route({ path: '${name}' }) decorator to '${name}' or unintentionally set routingMode to 'configured-only'?`);
            case 'configured-first':
                if (ced === null) {
                    if (name === '') {
                        return null;
                    }
                    throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                }
                return createDirectNode(log, node, vi, append, ced);
        }
    }
    // If it's a multi-segment match, collapse the viewport instructions to correct the tree structure.
    const finalPath = rr.residue === null ? path : path.slice(0, -(rr.residue.length + 1));
    vi.component.value = finalPath;
    for (let i = 0; i < collapse; ++i) {
        vi.children = vi.children[0].children;
    }
    return createConfiguredNode(log, node, vi, append, rr);
}
function createConfiguredNode(log, node, vi, append, rr, route = rr.route.endpoint.route) {
    const ctx = node.context;
    const rt = node.tree;
    return onResolve(route.handler, $handler => {
        route.handler = $handler;
        if ($handler.redirectTo === null) {
            const vpName = $handler.viewport;
            const ced = $handler.component;
            const vpa = ctx.resolveViewportAgent(ViewportRequest.create({
                viewportName: vpName,
                componentName: ced.name,
                append,
                resolution: rt.options.resolutionMode,
            }));
            const router = ctx.get(IRouter);
            const childCtx = router.getRouteContext(vpa, ced, vpa.hostController.context);
            childCtx.node = RouteNode.create({
                path: rr.route.endpoint.route.path,
                finalPath: route.path,
                context: childCtx,
                instruction: vi,
                params: {
                    ...node.params,
                    ...rr.route.params
                },
                queryParams: rt.queryParams,
                fragment: rt.fragment,
                data: $handler.data,
                viewport: vpName,
                component: ced,
                append,
                title: $handler.config.title,
                residue: rr.residue === null ? [] : [ViewportInstruction.create(rr.residue)],
            });
            childCtx.node.setTree(node.tree);
            log.trace(`createConfiguredNode(vi:%s) -> %s`, vi, childCtx.node);
            return childCtx.node;
        }
        // Migrate parameters to the redirect
        const origPath = RouteExpression.parse(route.path, false);
        const redirPath = RouteExpression.parse($handler.redirectTo, false);
        let origCur;
        let redirCur;
        const newSegs = [];
        switch (origPath.root.kind) {
            case 2 /* ScopedSegment */:
            case 4 /* Segment */:
                origCur = origPath.root;
                break;
            default:
                throw new Error(`Unexpected expression kind ${origPath.root.kind}`);
        }
        switch (redirPath.root.kind) {
            case 2 /* ScopedSegment */:
            case 4 /* Segment */:
                redirCur = redirPath.root;
                break;
            default:
                throw new Error(`Unexpected expression kind ${redirPath.root.kind}`);
        }
        let origSeg;
        let redirSeg;
        let origDone = false;
        let redirDone = false;
        while (!(origDone && redirDone)) {
            if (origDone) {
                origSeg = null;
            }
            else if (origCur.kind === 4 /* Segment */) {
                origSeg = origCur;
                origDone = true;
            }
            else if (origCur.left.kind === 4 /* Segment */) {
                origSeg = origCur.left;
                switch (origCur.right.kind) {
                    case 2 /* ScopedSegment */:
                    case 4 /* Segment */:
                        origCur = origCur.right;
                        break;
                    default:
                        throw new Error(`Unexpected expression kind ${origCur.right.kind}`);
                }
            }
            else {
                throw new Error(`Unexpected expression kind ${origCur.left.kind}`);
            }
            if (redirDone) {
                redirSeg = null;
            }
            else if (redirCur.kind === 4 /* Segment */) {
                redirSeg = redirCur;
                redirDone = true;
            }
            else if (redirCur.left.kind === 4 /* Segment */) {
                redirSeg = redirCur.left;
                switch (redirCur.right.kind) {
                    case 2 /* ScopedSegment */:
                    case 4 /* Segment */:
                        redirCur = redirCur.right;
                        break;
                    default:
                        throw new Error(`Unexpected expression kind ${redirCur.right.kind}`);
                }
            }
            else {
                throw new Error(`Unexpected expression kind ${redirCur.left.kind}`);
            }
            if (redirSeg !== null) {
                if (redirSeg.component.isDynamic && (origSeg === null || origSeg === void 0 ? void 0 : origSeg.component.isDynamic)) {
                    newSegs.push(rr.route.params[origSeg.component.name]);
                }
                else {
                    newSegs.push(redirSeg.raw);
                }
            }
        }
        const newPath = newSegs.filter(Boolean).join('/');
        const redirRR = ctx.recognize(newPath);
        if (redirRR === null) {
            const name = newPath;
            const ced = ctx.find(CustomElement, newPath);
            switch (rt.options.routingMode) {
                case 'configured-only':
                    if (ced === null) {
                        throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${name}' to the routes list of the route decorator of '${ctx.component.name}'?`);
                    }
                    throw new Error(`'${name}' did not match any configured route, but it does match a registered component name at '${ctx.friendlyPath}' - did you forget to add a @route({ path: '${name}' }) decorator to '${name}' or unintentionally set routingMode to 'configured-only'?`);
                case 'configured-first':
                    if (ced === null) {
                        throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                    }
                    return createDirectNode(log, node, vi, append, ced);
            }
        }
        return createConfiguredNode(log, node, vi, append, rr, redirRR.route.endpoint.route);
    });
}
function createDirectNode(log, node, vi, append, ced) {
    var _a;
    const ctx = node.context;
    const rt = node.tree;
    const vpName = (_a = vi.viewport) !== null && _a !== void 0 ? _a : 'default';
    const vpa = ctx.resolveViewportAgent(ViewportRequest.create({
        viewportName: vpName,
        componentName: ced.name,
        append,
        resolution: rt.options.resolutionMode,
    }));
    const router = ctx.get(IRouter);
    const childCtx = router.getRouteContext(vpa, ced, vpa.hostController.context);
    // TODO(fkleuver): process redirects in direct routing (?)
    const rd = RouteDefinition.resolve(ced);
    // TODO: add ActionExpression state representation to RouteNode
    childCtx.node = RouteNode.create({
        path: ced.name,
        finalPath: ced.name,
        context: childCtx,
        instruction: vi,
        params: {
            ...ctx.node.params,
            ...vi.params,
        },
        queryParams: rt.queryParams,
        fragment: rt.fragment,
        data: rd.data,
        viewport: vpName,
        component: ced,
        append,
        title: rd.config.title,
        residue: [...vi.children],
    });
    childCtx.node.setTree(ctx.node.tree);
    log.trace(`createDirectNode(vi:%s) -> %s`, vi, childCtx.node);
    return childCtx.node;
}
function appendNode(log, node, childNode) {
    return onResolve(childNode, $childNode => {
        log.trace(`appendNode($childNode:%s)`, $childNode);
        node.appendChild($childNode);
        return $childNode.context.vpa.scheduleUpdate(node.tree.options, $childNode);
    });
}
//# sourceMappingURL=route-tree.js.map