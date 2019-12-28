import {
  EnumDeclaration,
  EnumMember,
  InterfaceDeclaration,
  ModifierFlags,
  SyntaxKind,
  TypeAliasDeclaration,
  VariableStatement,
  createVariableStatement,
  createVariableDeclarationList,
  createVariableDeclaration,
  createCall,
  createFunctionExpression,
  createParameter,
  createBlock,
  createLogicalOr,
  createAssignment,
  createObjectLiteral,
  createExpressionStatement,
  createElementAccess,
  createNumericLiteral,
  Identifier,
  createStringLiteral,
  createReturn,
  NodeFlags,
} from 'typescript';
import {
  PLATFORM,
  ILogger,
} from '@aurelia/kernel';
import {
  Realm,
} from '../realm';
import {
  $String,
} from '../types/string';
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
  TransformationContext,
  transformModifiers,
} from './_shared';
import {
  ExportEntryRecord,
  $$ESModuleOrScript,
} from './modules';
import {
  $Identifier,
} from './expressions';
import {
  $HeritageClause,
} from './classes';

const {
  emptyArray,
} = PLATFORM;

export class $InterfaceDeclaration implements I$Node {
  public get $kind(): SyntaxKind.InterfaceDeclaration { return SyntaxKind.InterfaceDeclaration; }

  public modifierFlags!: ModifierFlags;

  public BoundNames!: readonly [$String];
  public VarDeclaredNames: readonly $String[] = emptyArray;
  public VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;
  public LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public ExportedBindings!: readonly $String[];
  public ExportedNames!: readonly $String[];
  public ExportEntries!: readonly ExportEntryRecord[];

  public TypeDeclarations!: readonly [$InterfaceDeclaration];
  public IsType: true = true;

  public $name!: $Identifier;
  public $heritageClauses!: readonly $HeritageClause[];

  public parent!: $NodeWithStatements;
  public readonly path: string;

  private constructor(
    public readonly node: InterfaceDeclaration,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.InterfaceDeclaration`;
  }

  public static create(
    node: InterfaceDeclaration,
    ctx: Context,
    idx: number,
    depth: number,
    mos: $$ESModuleOrScript,
    realm: Realm,
    logger: ILogger,
    path: string,
  ): $InterfaceDeclaration {
    const $node = new $InterfaceDeclaration(node, ctx, idx, depth, mos, realm, logger, path);

    const intrinsics = realm['[[Intrinsics]]'];

    ctx |= Context.InTypeElement;

    const modifierFlags = $node.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = $node.$name = $identifier(node.name, ctx, -1, depth + 1, mos, realm, logger, path);
    $name.parent = $node;
    const $heritageClauses = $node.$heritageClauses = $heritageClauseList(node.heritageClauses, ctx, depth + 1, mos, realm, logger, path);
    $heritageClauses.forEach(x => x.parent = $node);

    const BoundNames = $node.BoundNames = $name.BoundNames;
    $node.TypeDeclarations = [$node];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      $node.ExportedBindings = BoundNames;
      $node.ExportedNames = BoundNames;
      $node.ExportEntries = [
        new ExportEntryRecord(
          /* source */$node,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      $node.ExportedBindings = emptyArray;
      $node.ExportedNames = emptyArray;
      $node.ExportEntries = emptyArray;
    }

    return $node;
  }

  public transform(tctx: TransformationContext): undefined {
    return void 0;
  }
}

export class $TypeAliasDeclaration implements I$Node {
  public get $kind(): SyntaxKind.TypeAliasDeclaration { return SyntaxKind.TypeAliasDeclaration; }

  public modifierFlags!: ModifierFlags;

  public BoundNames!: readonly [$String];
  public VarDeclaredNames: readonly $String[] = emptyArray;
  public VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;
  public LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public ExportedBindings!: readonly $String[];
  public ExportedNames!: readonly $String[];
  public ExportEntries!: readonly ExportEntryRecord[];

  public TypeDeclarations!: readonly [$TypeAliasDeclaration];
  public IsType: true = true;

  public $name!: $Identifier;

  public parent!: $NodeWithStatements;
  public readonly path: string;

  private constructor(
    public readonly node: TypeAliasDeclaration,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.TypeAliasDeclaration`;
  }

  public static create(
    node: TypeAliasDeclaration,
    ctx: Context,
    idx: number,
    depth: number,
    mos: $$ESModuleOrScript,
    realm: Realm,
    logger: ILogger,
    path: string,
  ): $TypeAliasDeclaration {
    const $node = new $TypeAliasDeclaration(node, ctx, idx, depth, mos, realm, logger, path);

    const intrinsics = realm['[[Intrinsics]]'];

    ctx |= Context.InTypeElement;

    const modifierFlags = $node.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = $node.$name = $identifier(node.name, ctx, -1, depth + 1, mos, realm, logger, path);
    $name.parent = $node;

    const BoundNames = $node.BoundNames = $name.BoundNames;
    $node.TypeDeclarations = [$node];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      $node.ExportedBindings = BoundNames;
      $node.ExportedNames = BoundNames;
      $node.ExportEntries = [
        new ExportEntryRecord(
          /* source */$node,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      $node.ExportedBindings = emptyArray;
      $node.ExportedNames = emptyArray;
      $node.ExportEntries = emptyArray;
    }

    return $node;
  }

  public transform(tctx: TransformationContext): undefined {
    return void 0;
  }
}

export function $enumMemberList(
  nodes: readonly EnumMember[],
  ctx: Context,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): readonly $EnumMember[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $EnumMember[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = $EnumMember.create(nodes[i], ctx, i, depth + 1, mos, realm, logger, path);
  }
  return $nodes;
}

export class $EnumDeclaration implements I$Node {
  public get $kind(): SyntaxKind.EnumDeclaration { return SyntaxKind.EnumDeclaration; }

  public modifierFlags!: ModifierFlags;

  public BoundNames!: readonly [$String];
  public VarDeclaredNames: readonly $String[] = emptyArray;
  public VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;
  public LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public ExportedBindings!: readonly $String[];
  public ExportedNames!: readonly $String[];
  public ExportEntries!: readonly ExportEntryRecord[];

  public TypeDeclarations!: readonly [$EnumDeclaration];
  public IsType: true = true;

  public $name!: $Identifier;
  public $members!: readonly $EnumMember[];

  public parent!: $NodeWithStatements;
  public readonly path: string;

  private constructor(
    public readonly node: EnumDeclaration,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.EnumDeclaration`;
  }

  public static create(
    node: EnumDeclaration,
    ctx: Context,
    idx: number,
    depth: number,
    mos: $$ESModuleOrScript,
    realm: Realm,
    logger: ILogger,
    path: string,
  ): $EnumDeclaration {
    const $node = new $EnumDeclaration(node, ctx, idx, depth, mos, realm, logger, path);

    const intrinsics = realm['[[Intrinsics]]'];

    const modifierFlags = $node.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = $node.$name = $identifier(node.name, ctx, -1, depth + 1, mos, realm, logger, path);
    $name.parent = $node;
    const $members = $node.$members = $enumMemberList(node.members, ctx, depth + 1, mos, realm, logger, path);
    $members.forEach(x => x.parent = $node);

    const BoundNames = $node.BoundNames = $name.BoundNames;
    $node.TypeDeclarations = [$node];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      $node.ExportedBindings = BoundNames;
      $node.ExportedNames = BoundNames;
      $node.ExportEntries = [
        new ExportEntryRecord(
          /* source */$node,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      $node.ExportedBindings = emptyArray;
      $node.ExportedNames = emptyArray;
      $node.ExportEntries = emptyArray;
    }

    return $node;
  }

  public transform(tctx: TransformationContext): VariableStatement {
    const node = this.node;
    // TODO: inline const enums instead
    return createVariableStatement(
      /* modifiers       */node.modifiers === void 0 ? void 0 : transformModifiers(node.modifiers),
      /* declarationList */createVariableDeclarationList(
        /* declarations    */[
          createVariableDeclaration(
            /* name            */node.name,
            /* type            */void 0,
            /* initializer     */createCall(
              /* expression      */createFunctionExpression(
                /* modifiers       */void 0,
                /* asteriskToken   */void 0,
                /* name            */void 0,
                /* typeParameters  */void 0,
                /* parameters      */[
                  createParameter(
                    /* decorators      */void 0,
                    /* modifiers       */void 0,
                    /* dotDotDotToken  */void 0,
                    /* name            */node.name,
                  ),
                ],
                /* typeNode        */void 0,
                /* body            */createBlock(
                  /* statements      */[
                    ...node.members.map(
                      (m, i) => createExpressionStatement(
                        /* expression      */createAssignment(
                          /* left            */createElementAccess(
                            /* expression      */node.name,
                            /* index           */createAssignment(
                              /* left            */createElementAccess(
                                /* expression      */node.name,
                                /* index           */createStringLiteral((m.name as Identifier).text),
                              ),
                              /* right           */m.initializer === void 0
                                ? createNumericLiteral(i.toString())
                                : m.initializer,
                            ),
                          ),
                          /* right           */createStringLiteral((m.name as Identifier).text),
                        ),
                      ),
                    ),
                    createReturn(node.name),
                  ],
                  /* multiLine       */true,
                ),
              ),
              /* typeArguments   */void 0,
              /* argumentsArray  */[
                createLogicalOr(
                  /* left            */node.name,
                  /* right           */createAssignment(
                    /* left            */node.name,
                    /* right           */createObjectLiteral(),
                  ),
                ),
              ],
            ),
          ),
        ],
        /* flags           */NodeFlags.Const,
      ),
    );
  }
}

export class $EnumMember implements I$Node {
  public get $kind(): SyntaxKind.EnumMember { return SyntaxKind.EnumMember; }

  public $name!: $$PropertyName;
  public $initializer!: $$AssignmentExpressionOrHigher | undefined;

  public parent!: $EnumDeclaration;
  public readonly path: string;

  private constructor(
    public readonly node: EnumMember,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.EnumMember`;
  }

  public static create(
    node: EnumMember,
    ctx: Context,
    idx: number,
    depth: number,
    mos: $$ESModuleOrScript,
    realm: Realm,
    logger: ILogger,
    path: string,
  ): $EnumMember {
    const $node = new $EnumMember(node, ctx, idx, depth, mos, realm, logger, path);

    $node.$name = $$propertyName(node.name, ctx | Context.IsMemberName, -1, depth + 1, mos, realm, logger, path);
    const $initializer = $node.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode | undefined, ctx, -1, depth + 1, mos, realm, logger, path);
    if ($initializer !== void 0) { $initializer.parent = $node; }

    return $node;
  }
}
