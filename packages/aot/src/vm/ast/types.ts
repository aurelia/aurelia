import {
  EnumDeclaration,
  EnumMember,
  InterfaceDeclaration,
  ModifierFlags,
  SyntaxKind,
  TypeAliasDeclaration,
} from 'typescript';
import {
  emptyArray,
  ILogger,
} from '@aurelia/kernel';
import {
  Realm,
} from '../realm.js';
import {
  $String,
} from '../types/string.js';
import {
  I$Node,
  Context,
  $$ESDeclaration,
  $NodeWithStatements,
  modifiersToModifierFlags,
  hasBit,
  $identifier,
  $heritageClauseList,
  $$PropertyName,
  $$AssignmentExpressionOrHigher,
  $$propertyName,
  $assignmentExpression,
  $AssignmentExpressionNode,
  $i,
  $$ESVarDeclaration,
} from './_shared.js';
import {
  ExportEntryRecord,
  $$ESModuleOrScript,
} from './modules.js';
import {
  $Identifier,
} from './expressions.js';
import {
  $HeritageClause,
} from './classes.js';

export class $InterfaceDeclaration implements I$Node {
  public get $kind(): SyntaxKind.InterfaceDeclaration { return SyntaxKind.InterfaceDeclaration; }

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;
  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$InterfaceDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;
  public readonly $heritageClauses: readonly $HeritageClause[];

  public constructor(
    public readonly node: InterfaceDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.InterfaceDeclaration`,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];

    ctx |= Context.InTypeElement;

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx, -1);
    this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

export class $TypeAliasDeclaration implements I$Node {
  public get $kind(): SyntaxKind.TypeAliasDeclaration { return SyntaxKind.TypeAliasDeclaration; }

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;
  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$TypeAliasDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;

  public constructor(
    public readonly node: TypeAliasDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.TypeAliasDeclaration`,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];

    ctx |= Context.InTypeElement;

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx, -1);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

export function $enumMemberList(
  nodes: readonly EnumMember[],
  parent: $EnumDeclaration,
  ctx: Context,
): readonly $EnumMember[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $EnumMember[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $EnumMember(nodes[i], parent, ctx, i);
  }
  return $nodes;
}

export class $EnumDeclaration implements I$Node {
  public get $kind(): SyntaxKind.EnumDeclaration { return SyntaxKind.EnumDeclaration; }

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;
  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$EnumDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;
  public readonly $members: readonly $EnumMember[];

  public constructor(
    public readonly node: EnumDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.EnumDeclaration`,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx, -1);
    this.$members = $enumMemberList(node.members, this, ctx);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

export class $EnumMember implements I$Node {
  public get $kind(): SyntaxKind.EnumMember { return SyntaxKind.EnumMember; }

  public readonly $name: $$PropertyName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  public constructor(
    public readonly node: EnumMember,
    public readonly parent: $EnumDeclaration,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.EnumMember`,
  ) {
    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName, -1);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx, -1);
  }
}
