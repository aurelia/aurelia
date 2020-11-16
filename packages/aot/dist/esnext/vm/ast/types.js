import { ModifierFlags, SyntaxKind, } from 'typescript';
import { emptyArray, } from '@aurelia/kernel';
import { modifiersToModifierFlags, hasBit, $identifier, $heritageClauseList, $$propertyName, $assignmentExpression, $i, } from './_shared.js';
import { ExportEntryRecord, } from './modules.js';
export class $InterfaceDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.InterfaceDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.VarDeclaredNames = emptyArray;
        this.VarScopedDeclarations = emptyArray;
        this.LexicallyDeclaredNames = emptyArray;
        this.LexicallyScopedDeclarations = emptyArray;
        this.IsType = true;
        const intrinsics = realm['[[Intrinsics]]'];
        ctx |= 128 /* InTypeElement */;
        const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);
        if (hasBit(modifierFlags, ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        const $name = this.$name = $identifier(node.name, this, ctx, -1);
        this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);
        const BoundNames = this.BoundNames = $name.BoundNames;
        this.TypeDeclarations = [this];
        if (hasBit(ctx, 4096 /* InExport */)) {
            const [localName] = BoundNames;
            this.ExportedBindings = BoundNames;
            this.ExportedNames = BoundNames;
            this.ExportEntries = [
                new ExportEntryRecord(
                /* source */ this, 
                /* ExportName */ localName, 
                /* ModuleRequest */ intrinsics.null, 
                /* ImportName */ intrinsics.null, 
                /* LocalName */ localName),
            ];
        }
        else {
            this.ExportedBindings = emptyArray;
            this.ExportedNames = emptyArray;
            this.ExportEntries = emptyArray;
        }
    }
    get $kind() { return SyntaxKind.InterfaceDeclaration; }
}
export class $TypeAliasDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.TypeAliasDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.VarDeclaredNames = emptyArray;
        this.VarScopedDeclarations = emptyArray;
        this.LexicallyDeclaredNames = emptyArray;
        this.LexicallyScopedDeclarations = emptyArray;
        this.IsType = true;
        const intrinsics = realm['[[Intrinsics]]'];
        ctx |= 128 /* InTypeElement */;
        const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);
        if (hasBit(modifierFlags, ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        const $name = this.$name = $identifier(node.name, this, ctx, -1);
        const BoundNames = this.BoundNames = $name.BoundNames;
        this.TypeDeclarations = [this];
        if (hasBit(ctx, 4096 /* InExport */)) {
            const [localName] = BoundNames;
            this.ExportedBindings = BoundNames;
            this.ExportedNames = BoundNames;
            this.ExportEntries = [
                new ExportEntryRecord(
                /* source */ this, 
                /* ExportName */ localName, 
                /* ModuleRequest */ intrinsics.null, 
                /* ImportName */ intrinsics.null, 
                /* LocalName */ localName),
            ];
        }
        else {
            this.ExportedBindings = emptyArray;
            this.ExportedNames = emptyArray;
            this.ExportEntries = emptyArray;
        }
    }
    get $kind() { return SyntaxKind.TypeAliasDeclaration; }
}
export function $enumMemberList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new $EnumMember(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
export class $EnumDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.EnumDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.VarDeclaredNames = emptyArray;
        this.VarScopedDeclarations = emptyArray;
        this.LexicallyDeclaredNames = emptyArray;
        this.LexicallyScopedDeclarations = emptyArray;
        this.IsType = true;
        const intrinsics = realm['[[Intrinsics]]'];
        const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);
        if (hasBit(modifierFlags, ModifierFlags.Export)) {
            ctx |= 4096 /* InExport */;
        }
        const $name = this.$name = $identifier(node.name, this, ctx, -1);
        this.$members = $enumMemberList(node.members, this, ctx);
        const BoundNames = this.BoundNames = $name.BoundNames;
        this.TypeDeclarations = [this];
        if (hasBit(ctx, 4096 /* InExport */)) {
            const [localName] = BoundNames;
            this.ExportedBindings = BoundNames;
            this.ExportedNames = BoundNames;
            this.ExportEntries = [
                new ExportEntryRecord(
                /* source */ this, 
                /* ExportName */ localName, 
                /* ModuleRequest */ intrinsics.null, 
                /* ImportName */ intrinsics.null, 
                /* LocalName */ localName),
            ];
        }
        else {
            this.ExportedBindings = emptyArray;
            this.ExportedNames = emptyArray;
            this.ExportEntries = emptyArray;
        }
    }
    get $kind() { return SyntaxKind.EnumDeclaration; }
}
export class $EnumMember {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.EnumMember`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$name = $$propertyName(node.name, this, ctx | 512 /* IsMemberName */, -1);
        this.$initializer = $assignmentExpression(node.initializer, this, ctx, -1);
    }
    get $kind() { return SyntaxKind.EnumMember; }
}
//# sourceMappingURL=types.js.map