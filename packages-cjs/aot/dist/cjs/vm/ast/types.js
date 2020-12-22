"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$EnumMember = exports.$EnumDeclaration = exports.$enumMemberList = exports.$TypeAliasDeclaration = exports.$InterfaceDeclaration = void 0;
const typescript_1 = require("typescript");
const kernel_1 = require("@aurelia/kernel");
const _shared_js_1 = require("./_shared.js");
const modules_js_1 = require("./modules.js");
class $InterfaceDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.InterfaceDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.VarDeclaredNames = kernel_1.emptyArray;
        this.VarScopedDeclarations = kernel_1.emptyArray;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.IsType = true;
        const intrinsics = realm['[[Intrinsics]]'];
        ctx |= 128 /* InTypeElement */;
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        if (_shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        const $name = this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        this.$heritageClauses = _shared_js_1.$heritageClauseList(node.heritageClauses, this, ctx);
        const BoundNames = this.BoundNames = $name.BoundNames;
        this.TypeDeclarations = [this];
        if (_shared_js_1.hasBit(ctx, 4096 /* InExport */)) {
            const [localName] = BoundNames;
            this.ExportedBindings = BoundNames;
            this.ExportedNames = BoundNames;
            this.ExportEntries = [
                new modules_js_1.ExportEntryRecord(
                /* source */ this, 
                /* ExportName */ localName, 
                /* ModuleRequest */ intrinsics.null, 
                /* ImportName */ intrinsics.null, 
                /* LocalName */ localName),
            ];
        }
        else {
            this.ExportedBindings = kernel_1.emptyArray;
            this.ExportedNames = kernel_1.emptyArray;
            this.ExportEntries = kernel_1.emptyArray;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.InterfaceDeclaration; }
}
exports.$InterfaceDeclaration = $InterfaceDeclaration;
class $TypeAliasDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.TypeAliasDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.VarDeclaredNames = kernel_1.emptyArray;
        this.VarScopedDeclarations = kernel_1.emptyArray;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.IsType = true;
        const intrinsics = realm['[[Intrinsics]]'];
        ctx |= 128 /* InTypeElement */;
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        if (_shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        const $name = this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        const BoundNames = this.BoundNames = $name.BoundNames;
        this.TypeDeclarations = [this];
        if (_shared_js_1.hasBit(ctx, 4096 /* InExport */)) {
            const [localName] = BoundNames;
            this.ExportedBindings = BoundNames;
            this.ExportedNames = BoundNames;
            this.ExportEntries = [
                new modules_js_1.ExportEntryRecord(
                /* source */ this, 
                /* ExportName */ localName, 
                /* ModuleRequest */ intrinsics.null, 
                /* ImportName */ intrinsics.null, 
                /* LocalName */ localName),
            ];
        }
        else {
            this.ExportedBindings = kernel_1.emptyArray;
            this.ExportedNames = kernel_1.emptyArray;
            this.ExportEntries = kernel_1.emptyArray;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.TypeAliasDeclaration; }
}
exports.$TypeAliasDeclaration = $TypeAliasDeclaration;
function $enumMemberList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return kernel_1.emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new $EnumMember(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
exports.$enumMemberList = $enumMemberList;
class $EnumDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.EnumDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.VarDeclaredNames = kernel_1.emptyArray;
        this.VarScopedDeclarations = kernel_1.emptyArray;
        this.LexicallyDeclaredNames = kernel_1.emptyArray;
        this.LexicallyScopedDeclarations = kernel_1.emptyArray;
        this.IsType = true;
        const intrinsics = realm['[[Intrinsics]]'];
        const modifierFlags = this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        if (_shared_js_1.hasBit(modifierFlags, typescript_1.ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        const $name = this.$name = _shared_js_1.$identifier(node.name, this, ctx, -1);
        this.$members = $enumMemberList(node.members, this, ctx);
        const BoundNames = this.BoundNames = $name.BoundNames;
        this.TypeDeclarations = [this];
        if (_shared_js_1.hasBit(ctx, 4096 /* InExport */)) {
            const [localName] = BoundNames;
            this.ExportedBindings = BoundNames;
            this.ExportedNames = BoundNames;
            this.ExportEntries = [
                new modules_js_1.ExportEntryRecord(
                /* source */ this, 
                /* ExportName */ localName, 
                /* ModuleRequest */ intrinsics.null, 
                /* ImportName */ intrinsics.null, 
                /* LocalName */ localName),
            ];
        }
        else {
            this.ExportedBindings = kernel_1.emptyArray;
            this.ExportedNames = kernel_1.emptyArray;
            this.ExportEntries = kernel_1.emptyArray;
        }
    }
    get $kind() { return typescript_1.SyntaxKind.EnumDeclaration; }
}
exports.$EnumDeclaration = $EnumDeclaration;
class $EnumMember {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.EnumMember`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$name = _shared_js_1.$$propertyName(node.name, this, ctx | 512 /* IsMemberName */, -1);
        this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.EnumMember; }
}
exports.$EnumMember = $EnumMember;
//# sourceMappingURL=types.js.map