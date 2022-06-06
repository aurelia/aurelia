import {
  Block,
  BreakStatement,
  CaseBlock,
  CaseClause,
  CatchClause,
  ContinueStatement,
  DebuggerStatement,
  DefaultClause,
  DoStatement,
  EmptyStatement,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  IfStatement,
  LabeledStatement,
  ModifierFlags,
  NodeArray,
  NodeFlags,
  ReturnStatement,
  StringLiteral,
  SwitchStatement,
  SyntaxKind,
  ThrowStatement,
  TryStatement,
  VariableDeclaration,
  VariableDeclarationList,
  VariableStatement,
  WhileStatement,
  WithStatement,
  Expression,
  CaseOrDefaultClause,
} from 'typescript';
import {
  emptyArray,
  ILogger,
} from '@aurelia/kernel';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $DeclarativeEnvRec,
} from '../types/environment-record';
import {
  $String,
} from '../types/string';
import {
  $Undefined,
} from '../types/undefined';
import {
  $Any,
  CompletionType,
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $Empty,
} from '../types/empty';
import {
  I$Node,
  Context,
  $$ESDeclaration,
  $NodeWithStatements,
  clearBit,
  modifiersToModifierFlags,
  hasBit,
  $identifier,
  $$AssignmentExpressionOrHigher,
  $assignmentExpression,
  $AssignmentExpressionNode,
  $$TSDeclaration,
  $$BindingName,
  $$bindingName,
  getBoundNames,
  getVarDeclaredNames,
  getVarScopedDeclarations,
  $$TSStatementListItem,
  $$tsStatementList,
  $StatementNode,
  BlockDeclarationInstantiation,
  evaluateStatementList,
  evaluateStatement,
  $$ESLabelledItem,
  $$esLabelledItem,
  getLexicallyDeclaredNames,
  getLexicallyScopedDeclarations,
  $i,
  $$ESVarDeclaration,
} from './_shared';
import {
  ExportEntryRecord,
  $$ESModuleOrScript,
} from './modules';
import {
  $Identifier,
} from './expressions';
import {
  $ObjectBindingPattern,
} from './bindings';
import {
  $StringSet,
} from '../globals/string';
import {
  $LoopContinues,
} from '../operations';

export class $VariableStatement implements I$Node {
  public get $kind(): SyntaxKind.VariableStatement { return SyntaxKind.VariableStatement; }

  public readonly modifierFlags: ModifierFlags;

  public readonly $declarationList: $VariableDeclarationList;

  public readonly isLexical: boolean;

  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  // 13.3.2.1 Static Semantics: BoundNames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-vardeclarednames
  // 13.3.2.2 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  // 13.3.2.3 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportedbindings
  // 15.2.3.3 Static Semantics: ExportedBindings
  public readonly ExportedBindings: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportednames
  // 15.2.3.4 Static Semantics: ExportedNames
  public readonly ExportedNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportentries
  // 15.2.3.5 Static Semantics: ExportEntries
  public readonly ExportEntries: readonly ExportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-isconstantdeclaration
  // 15.2.3.7 Static Semantics: IsConstantDeclaration
  public readonly IsConstantDeclaration: boolean;
  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-lexicallyscopeddeclarations
  // 15.2.3.8 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-modulerequests
  // 15.2.3.9 Static Semantics: ModuleRequests
  public readonly ModuleRequests: readonly $String[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: VariableStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.VariableStatement`,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    ctx |= Context.InVariableStatement;

    if (hasBit(this.modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $declarationList = this.$declarationList = new $VariableDeclarationList(
      node.declarationList,
      this,
      ctx,
    );

    const isLexical = this.isLexical = $declarationList.isLexical;
    this.IsConstantDeclaration = $declarationList.IsConstantDeclaration;

    const BoundNames = this.BoundNames = $declarationList.BoundNames;
    this.VarDeclaredNames = $declarationList.VarDeclaredNames;
    this.VarScopedDeclarations = $declarationList.VarScopedDeclarations;

    if (hasBit(ctx, Context.InExport)) {
      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = BoundNames.map(name =>
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */name,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */name,
        )
      );

      if (isLexical) {
        this.LexicallyScopedDeclarations = [this];
      } else {
        this.LexicallyScopedDeclarations = emptyArray;
      }
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;

      this.LexicallyScopedDeclarations = emptyArray;
    }

    this.ModuleRequests = emptyArray;
  }

  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-runtime-semantics-evaluation
  // 13.3.1.4 Runtime Semantics: Evaluation
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-runtime-semantics-evaluation
  // 13.3.2.4 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-runtime-semantics-evaluation
    // 13.3.1.4 Runtime Semantics: Evaluation

    // LexicalDeclaration : LetOrConst BindingList ;

    // 1. Let next be the result of evaluating BindingList.
    // 2. ReturnIfAbrupt(next).
    // 3. Return NormalCompletion(empty).

    // BindingList : BindingList , LexicalBinding

    // 1. Let next be the result of evaluating BindingList.
    // 2. ReturnIfAbrupt(next).
    // 3. Return the result of evaluating LexicalBinding.

    // LexicalBinding : BindingIdentifier

    // 1. Let lhs be ResolveBinding(StringValue of BindingIdentifier).
    // 2. Return InitializeReferencedBinding(lhs, undefined).

    // LexicalBinding : BindingIdentifier Initializer

    // 1. Let bindingId be StringValue of BindingIdentifier.
    // 2. Let lhs be ResolveBinding(bindingId).
    // 3. If IsAnonymousFunctionDefinition(Initializer) is true, then
    // 3. a. Let value be the result of performing NamedEvaluation for Initializer with argument bindingId.
    // 4. Else,
    // 4. a. Let rhs be the result of evaluating Initializer.
    // 4. b. Let value be ? GetValue(rhs).
    // 5. Return InitializeReferencedBinding(lhs, value).

    // LexicalBinding : BindingPattern Initializer

    // 1. Let rhs be the result of evaluating Initializer.
    // 2. Let value be ? GetValue(rhs).
    // 3. Let env be the running execution context's LexicalEnvironment.
    // 4. Return the result of performing BindingInitialization for BindingPattern using value and env as the arguments.

    // http://www.ecma-international.org/ecma-262/#sec-variable-statement-runtime-semantics-evaluation
    // 13.3.2.4 Runtime Semantics: Evaluation

    // VariableStatement : var VariableDeclarationList ;

    // 1. Let next be the result of evaluating VariableDeclarationList.
    // 2. ReturnIfAbrupt(next).
    // 3. Return NormalCompletion(empty).

    // VariableDeclarationList : VariableDeclarationList , VariableDeclaration

    // 1. Let next be the result of evaluating VariableDeclarationList.
    // 2. ReturnIfAbrupt(next).
    // 3. Return the result of evaluating VariableDeclaration.

    // VariableDeclaration : BindingIdentifier

    // 1. Return NormalCompletion(empty).

    // VariableDeclaration : BindingIdentifier Initializer

    // 1. Let bindingId be StringValue of BindingIdentifier.
    // 2. Let lhs be ? ResolveBinding(bindingId).
    // 3. If IsAnonymousFunctionDefinition(Initializer) is true, then
    // 3. a. Let value be the result of performing NamedEvaluation for Initializer with argument bindingId.
    // 4. Else,
    // 4. a. Let rhs be the result of evaluating Initializer.
    // 4. b. Let value be ? GetValue(rhs).
    // 5. Return ? PutValue(lhs, value).

    // VariableDeclaration : BindingPattern Initializer

    // 1. Let rhs be the result of evaluating Initializer.
    // 2. Let rval be ? GetValue(rhs).
    // 3. Return the result of performing BindingInitialization for BindingPattern passing rval and undefined as arguments.

    return intrinsics.empty; // TODO: implement this
  }
}

export class $VariableDeclaration implements I$Node {
  public get $kind(): SyntaxKind.VariableDeclaration { return SyntaxKind.VariableDeclaration; }

  public readonly modifierFlags: ModifierFlags;
  public readonly combinedModifierFlags: ModifierFlags;

  public readonly $name: $$BindingName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  // 13.3.2.1 Static Semantics: BoundNames
  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-static-semantics-boundnames
  // 13.3.1.2 Static Semantics: BoundNames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-vardeclarednames
  // 13.3.2.2 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  // 13.3.2.3 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-static-semantics-isconstantdeclaration
  // 13.3.1.3 Static Semantics: IsConstantDeclaration
  public readonly IsConstantDeclaration: boolean;

  public constructor(
    public readonly node: VariableDeclaration,
    public readonly parent: $VariableDeclarationList | $CatchClause,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.VariableDeclaration`,
  ) {
    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(ctx, Context.InVariableStatement)) {
      this.combinedModifierFlags = modifierFlags | (parent as $VariableDeclarationList).combinedModifierFlags;
    } else {
      this.combinedModifierFlags = modifierFlags;
    }

    const $name = this.$name = $$bindingName(node.name, this, ctx, -1);

    // Clear this flag because it's used inside $Identifier to declare locals/exports
    // and we don't want to do that on the identifiers in types/initializers.
    ctx = clearBit(ctx, Context.InVariableStatement);

    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx, -1);

    this.BoundNames = $name.BoundNames;
    if (hasBit(ctx, Context.IsVar)) { // TODO: what about parameter and for declarations?
      this.VarDeclaredNames = this.BoundNames;
      this.VarScopedDeclarations = [this];
      this.IsConstantDeclaration = false;
    } else {
      this.VarDeclaredNames = emptyArray;
      this.VarScopedDeclarations = emptyArray;
      this.IsConstantDeclaration = hasBit(ctx, Context.IsConst);
    }
  }

  public InitializeBinding(
    ctx: ExecutionContext,
    value: $AnyNonEmpty,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;

    const bindingName = this.$name;
    const kind = bindingName.$kind;
    const boundNames = bindingName.BoundNames;
    const envRec = ctx.LexicalEnvironment;
    if ((boundNames?.length ?? 0) > 0) {
      switch (kind) {
        // http://www.ecma-international.org/ecma-262/#sec-identifiers-runtime-semantics-bindinginitialization
        // 12.1.5 Runtime Semantics: BindingInitialization
        // http://www.ecma-international.org/ecma-262/#sec-initializeboundname
        // 12.1.5.1 Runtime Semantics: InitializeBoundName ( name , value , environment )
        case SyntaxKind.Identifier: {
          const name = boundNames![0]?.GetValue(ctx);
          // 1. Assert: Type(name) is String.
          // 2. If environment is not undefined, then
          if (envRec !== void 0) {
            // 2. a. Let env be the EnvironmentRecord component of environment.
            // 2. b. Perform env.InitializeBinding(name, value).
            envRec.InitializeBinding(ctx, name, value);
            // 2. c. Return NormalCompletion(undefined).
            return realm['[[Intrinsics]]'].undefined;
          } else {
            // 3. Else,
            // 3. a. Let lhs be ResolveBinding(name).
            const lhs = realm.ResolveBinding(name);
            if (lhs.isAbrupt) { return lhs.enrichWith(ctx, this); } // TODO: is this correct? spec doesn't say it

            // 3. b. Return ? PutValue(lhs, value).
            return lhs.PutValue(ctx, value).enrichWith(ctx, this);
          }
        }
        case SyntaxKind.ObjectBindingPattern:
          (bindingName as $ObjectBindingPattern).InitializeBinding(ctx, value, envRec);
          break;

        case SyntaxKind.ArrayBindingPattern:
          // TODO
          break;
      }
    }

    return ctx.Realm['[[Intrinsics]]'].empty;
  }
}

export function $variableDeclarationList(
  nodes: readonly VariableDeclaration[],
  parent: $VariableDeclarationList,
  ctx: Context,
): readonly $VariableDeclaration[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $VariableDeclaration[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $VariableDeclaration(nodes[i], parent, ctx, i);
  }
  return $nodes;
}

export class $VariableDeclarationList implements I$Node {
  public get $kind(): SyntaxKind.VariableDeclarationList { return SyntaxKind.VariableDeclarationList; }

  public readonly combinedModifierFlags: ModifierFlags;

  public readonly $declarations: readonly $VariableDeclaration[];

  public readonly isLexical: boolean;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  // 13.3.2.1 Static Semantics: BoundNames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-vardeclarednames
  // 13.3.2.2 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  // 13.3.2.3 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-static-semantics-isconstantdeclaration
  // 13.3.1.3 Static Semantics: IsConstantDeclaration
  public readonly IsConstantDeclaration: boolean;

  public constructor(
    public readonly node: VariableDeclarationList,
    public readonly parent: $VariableStatement | $ForStatement | $ForOfStatement | $ForInStatement,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.VariableDeclarationList`,
  ) {
    this.isLexical = (node.flags & (NodeFlags.Const | NodeFlags.Let)) > 0;
    this.IsConstantDeclaration = (node.flags & NodeFlags.Const) > 0;

    if (hasBit(ctx, Context.InVariableStatement)) {
      this.combinedModifierFlags = (parent as $VariableStatement).modifierFlags;
    } else {
      this.combinedModifierFlags = ModifierFlags.None;
    }

    if (hasBit(node.flags, NodeFlags.Const)) {
      ctx |= Context.IsConst;
    } else if (hasBit(node.flags, NodeFlags.Let)) {
      ctx |= Context.IsLet;
    } else {
      ctx |= Context.IsVar;
    }

    const $declarations = this.$declarations = $variableDeclarationList(node.declarations, this, ctx);

    this.BoundNames = $declarations.flatMap(getBoundNames);
    this.VarDeclaredNames = $declarations.flatMap(getVarDeclaredNames);
    this.VarScopedDeclarations = $declarations.flatMap(getVarScopedDeclarations);
  }
}

// #region Statements

export class $Block implements I$Node {
  public get $kind(): SyntaxKind.Block { return SyntaxKind.Block; }

  public readonly $statements: readonly $$TSStatementListItem[];

  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-lexicallydeclarednames
  // 13.2.5 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-lexicallyscopeddeclarations
  // 13.2.6 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-toplevellexicallydeclarednames
  // 13.2.7 Static Semantics: TopLevelLexicallyDeclaredNames
  public readonly TopLevelLexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-toplevellexicallyscopeddeclarations
  // 13.2.8 Static Semantics: TopLevelLexicallyScopedDeclarations
  public readonly TopLevelLexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-toplevelvardeclarednames
  // 13.2.9 Static Semantics: TopLevelVarDeclaredNames
  public readonly TopLevelVarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-toplevelvarscopeddeclarations
  // 13.2.10 Static Semantics: TopLevelVarScopedDeclarations
  public readonly TopLevelVarScopedDeclarations: readonly $$ESVarDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-vardeclarednames
  // 13.2.11 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-varscopeddeclarations
  // 13.2.12 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: Block,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.Block`,
  ) {
    const $statements = this.$statements = $$tsStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);

    const LexicallyDeclaredNames = this.LexicallyDeclaredNames = [] as $String[];
    const LexicallyScopedDeclarations = this.LexicallyScopedDeclarations = [] as $$ESDeclaration[];
    const TopLevelLexicallyDeclaredNames = this.TopLevelLexicallyDeclaredNames = [] as $String[];
    const TopLevelLexicallyScopedDeclarations = this.TopLevelLexicallyScopedDeclarations = [] as $$ESDeclaration[];
    const TopLevelVarDeclaredNames = this.TopLevelVarDeclaredNames = [] as $String[];
    const TopLevelVarScopedDeclarations = this.TopLevelVarScopedDeclarations = [] as $$ESVarDeclaration[];
    const VarDeclaredNames = this.VarDeclaredNames = [] as $String[];
    const VarScopedDeclarations = this.VarScopedDeclarations = [] as $$ESVarDeclaration[];

    const len = $statements.length;
    let $statement: $$TSStatementListItem;
    for (let i = 0; i < len; ++i) {
      $statement = $statements[i];
      switch ($statement.$kind) {
        case SyntaxKind.FunctionDeclaration:
          LexicallyDeclaredNames.push(...$statement.BoundNames);
          LexicallyScopedDeclarations.push($statement);

          TopLevelVarDeclaredNames.push(...$statement.BoundNames);
          TopLevelVarScopedDeclarations.push($statement);
          break;
        case SyntaxKind.ClassDeclaration:
          LexicallyDeclaredNames.push(...$statement.BoundNames);
          LexicallyScopedDeclarations.push($statement);

          TopLevelLexicallyDeclaredNames.push(...$statement.BoundNames);
          TopLevelLexicallyScopedDeclarations.push($statement);
          break;
        case SyntaxKind.VariableStatement:
          if ($statement.isLexical) {
            LexicallyDeclaredNames.push(...$statement.BoundNames);
            LexicallyScopedDeclarations.push($statement);

            TopLevelLexicallyDeclaredNames.push(...$statement.BoundNames);
            TopLevelLexicallyScopedDeclarations.push($statement);
          } else {
            TopLevelVarDeclaredNames.push(...$statement.VarDeclaredNames);
            TopLevelVarScopedDeclarations.push(...$statement.VarScopedDeclarations);

            VarDeclaredNames.push(...$statement.VarDeclaredNames);
            VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
          }
          break;
        case SyntaxKind.LabeledStatement:
          LexicallyDeclaredNames.push(...$statement.LexicallyDeclaredNames);
          LexicallyScopedDeclarations.push(...$statement.LexicallyScopedDeclarations);

          TopLevelVarDeclaredNames.push(...$statement.TopLevelVarDeclaredNames);
          TopLevelVarScopedDeclarations.push(...$statement.TopLevelVarScopedDeclarations);

          VarDeclaredNames.push(...$statement.VarDeclaredNames);
          VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
          break;
        case SyntaxKind.Block:
        case SyntaxKind.IfStatement:
        case SyntaxKind.DoStatement:
        case SyntaxKind.WhileStatement:
        case SyntaxKind.ForStatement:
        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement:
        case SyntaxKind.WithStatement:
        case SyntaxKind.SwitchStatement:
        case SyntaxKind.TryStatement:
          TopLevelVarDeclaredNames.push(...$statement.VarDeclaredNames);
          TopLevelVarScopedDeclarations.push(...$statement.VarScopedDeclarations);

          VarDeclaredNames.push(...$statement.VarDeclaredNames);
          VarScopedDeclarations.push(...$statement.VarScopedDeclarations);
      }
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-block-runtime-semantics-evaluation
  // 13.2.13 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    const $statements = this.$statements;

    // Block : { }
    // 1. Return NormalCompletion(empty).
    if ($statements.length === 0) {
      return intrinsics.empty;
    }

    // Block : { StatementList }
    // 1. Let oldEnv be the running execution context's LexicalEnvironment.
    const oldEnv = ctx.LexicalEnvironment;
    // 2. Let blockEnv be NewDeclarativeEnvironment(oldEnv).
    const blockEnv = ctx.LexicalEnvironment = new $DeclarativeEnvRec(this.logger, realm, oldEnv);

    // 3. Perform BlockDeclarationInstantiation(StatementList, blockEnv).
    const $BlockDeclarationInstantiationResult = BlockDeclarationInstantiation(ctx, this.LexicallyScopedDeclarations, blockEnv);
    if ($BlockDeclarationInstantiationResult.isAbrupt) { return $BlockDeclarationInstantiationResult; }

    // 4. Set the running execution context's LexicalEnvironment to blockEnv.
    realm.stack.push(ctx);

    // 5. Let blockValue be the result of evaluating StatementList.
    const blockValue = evaluateStatementList(ctx, $statements);

    // 6. Set the running execution context's LexicalEnvironment to oldEnv.
    realm.stack.pop();
    ctx.LexicalEnvironment = oldEnv;

    // 7. Return blockValue.
    return blockValue;
  }
}

export class $EmptyStatement implements I$Node {
  public get $kind(): SyntaxKind.EmptyStatement { return SyntaxKind.EmptyStatement; }

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
  // 13.1.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  // 13.1.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;

  public constructor(
    public readonly node: EmptyStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.EmptyStatement`,
  ) {}

  // http://www.ecma-international.org/ecma-262/#sec-empty-statement-runtime-semantics-evaluation
  // 13.4.1 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // EmptyStatement : ;

    // 1. Return NormalCompletion(empty).
    return intrinsics.empty;
  }
}

export type ExpressionStatement_T<T extends Expression> = ExpressionStatement & {
  readonly expression: T;
};

export type DirectivePrologue = readonly ExpressionStatement_T<StringLiteral>[] & {
  readonly ContainsUseStrict?: true;
};

export class $ExpressionStatement implements I$Node {
  public get $kind(): SyntaxKind.ExpressionStatement { return SyntaxKind.ExpressionStatement; }

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
  // 13.1.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  // 13.1.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;

  public constructor(
    public readonly node: ExpressionStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ExpressionStatement`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
  }

  // http://www.ecma-international.org/ecma-262/#sec-expression-statement-runtime-semantics-evaluation
  // 13.5.1 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // ExpressionStatement : Expression ;

    // 1. Let exprRef be the result of evaluating Expression.
    // 2. Return ? GetValue(exprRef).

    return this.$expression.Evaluate(ctx).GetValue(ctx).enrichWith(ctx, this);
  }
}

export class $IfStatement implements I$Node {
  public get $kind(): SyntaxKind.IfStatement { return SyntaxKind.IfStatement; }

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $thenStatement: $$ESLabelledItem;
  public readonly $elseStatement: $$ESLabelledItem | undefined;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-if-statement-static-semantics-vardeclarednames
  // 13.6.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-if-statement-static-semantics-varscopeddeclarations
  // 13.6.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: IfStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.IfStatement`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
    const $thenStatement = this.$thenStatement = $$esLabelledItem(node.thenStatement as $StatementNode, this, ctx, -1);

    if (node.elseStatement === void 0) {
      this.$elseStatement = void 0;

      this.VarDeclaredNames = $thenStatement.VarDeclaredNames;
      this.VarScopedDeclarations = $thenStatement.VarScopedDeclarations;
    } else {
      const $elseStatement = this.$elseStatement = $$esLabelledItem(node.elseStatement as $StatementNode, this, ctx, -1);

      this.VarDeclaredNames = [
        ...$thenStatement.VarDeclaredNames,
        ...$elseStatement.VarDeclaredNames,
      ];
      this.VarScopedDeclarations = [
        ...$thenStatement.VarScopedDeclarations,
        ...$elseStatement.VarScopedDeclarations,
      ];
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-if-statement-runtime-semantics-evaluation
  // 13.6.7 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    const { $expression, $thenStatement, $elseStatement } = this;

    const exprRef = $expression.Evaluate(ctx);
    const exprValue = exprRef.GetValue(ctx).ToBoolean(ctx);

    if ($elseStatement !== undefined) {
      // IfStatement : if ( Expression ) Statement else Statement

      // 1. Let exprRef be the result of evaluating Expression.
      // 2. Let exprValue be ToBoolean(? GetValue(exprRef)).

      let stmtCompletion: $Any;
      // 3. If exprValue is true, then
      if (exprValue.is(intrinsics.true)) {
        // 3. a. Let stmtCompletion be the result of evaluating the first Statement.
        stmtCompletion = evaluateStatement(ctx, $thenStatement);
      } else {
        // 4. Else,
        // 4. a. Let stmtCompletion be the result of evaluating the second Statement.
        stmtCompletion = evaluateStatement(ctx, $elseStatement);
      }
      // 5. Return Completion(UpdateEmpty(stmtCompletion, undefined)).
      stmtCompletion.UpdateEmpty(intrinsics.undefined);
      return stmtCompletion;
    } else {
      // IfStatement : if ( Expression ) Statement

      // 1. Let exprRef be the result of evaluating Expression.
      // 2. Let exprValue be ToBoolean(? GetValue(exprRef)).
      let stmtCompletion: $Any;
      // 3. If exprValue is false, then
      if (exprValue.is(intrinsics.false)) {
        // 3. a. Return NormalCompletion(undefined).
        return new $Undefined(realm);
      } else {
        // 4. Else,
        // 4. a. Let stmtCompletion be the result of evaluating Statement.
        stmtCompletion = evaluateStatement(ctx, $thenStatement);
        // 4. b. Return Completion(UpdateEmpty(stmtCompletion, undefined)).
        stmtCompletion.UpdateEmpty(intrinsics.undefined);
        return stmtCompletion;
      }
    }
  }
}

export class $DoStatement implements I$Node {
  public get $kind(): SyntaxKind.DoStatement { return SyntaxKind.DoStatement; }

  public readonly $statement: $$ESLabelledItem;
  public readonly $expression: $$AssignmentExpressionOrHigher;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-do-while-statement-static-semantics-vardeclarednames
  // 13.7.2.4 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-do-while-statement-static-semantics-varscopeddeclarations
  // 13.7.2.5 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: DoStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.DoStatement`,
  ) {
    const $statement = this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx, -1);
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);

    this.VarDeclaredNames = $statement.VarDeclaredNames;
    this.VarScopedDeclarations = $statement.VarScopedDeclarations;
  }

  // http://www.ecma-international.org/ecma-262/#sec-do-while-statement-runtime-semantics-labelledevaluation
  // 13.7.2.6 Runtime Semantics: LabelledEvaluation
  public EvaluateLabelled(
    ctx: ExecutionContext,
    labelSet: $StringSet,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
    // IterationStatement : do Statement while ( Expression ) ;

    const expr = this.$expression;
    const stmt = this.$statement;

    // 1. Let V be undefined.
    let V: $Any = intrinsics.undefined;

    // 2. Repeat,
    while (true) {
      // 2. a. Let stmtResult be the result of evaluating Statement.
      const stmtResult = evaluateStatement(ctx, stmt);

      // 2. b. If LoopContinues(stmtResult, labelSet) is false, return Completion(UpdateEmpty(stmtResult, V)).
      if ($LoopContinues(ctx, stmtResult, labelSet).isFalsey) {
        return stmtResult.UpdateEmpty(V);
      }

      // 2. c. If stmtResult.[[Value]] is not empty, set V to stmtResult.[[Value]].
      if (!stmtResult.isEmpty) {
        V = stmtResult;
      }

      // 2. d. Let exprRef be the result of evaluating Expression.
      const exprRef = expr.Evaluate(ctx);

      // 2. e. Let exprValue be ? GetValue(exprRef).
      const exprValue = exprRef.GetValue(ctx);
      if (exprValue.isAbrupt) { return exprValue.enrichWith(ctx, this); }

      // 2. f. If ToBoolean(exprValue) is false, return NormalCompletion(V).
      const bool = exprValue.ToBoolean(ctx);
      if (bool.isAbrupt) { return bool.enrichWith(ctx, this); }
      if (bool.isFalsey) {
        return V.ToCompletion(CompletionType.normal, intrinsics.empty);
      }
    }
  }
}

export class $WhileStatement implements I$Node {
  public get $kind(): SyntaxKind.WhileStatement { return SyntaxKind.WhileStatement; }

  public readonly $statement: $$ESLabelledItem;
  public readonly $expression: $$AssignmentExpressionOrHigher;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-while-statement-static-semantics-vardeclarednames
  // 13.7.3.4 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-while-statement-static-semantics-varscopeddeclarations
  // 13.7.3.5 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: WhileStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.WhileStatement`,
  ) {
    const $statement = this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx, -1);
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);

    this.VarDeclaredNames = $statement.VarDeclaredNames;
    this.VarScopedDeclarations = $statement.VarScopedDeclarations;
  }

  // http://www.ecma-international.org/ecma-262/#sec-while-statement-runtime-semantics-labelledevaluation
  // 13.7.3.6 Runtime Semantics: LabelledEvaluation
  public EvaluateLabelled(
    ctx: ExecutionContext,
    labelSet: $StringSet,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
    // IterationStatement : while ( Expression ) Statement

    const expr = this.$expression;
    const stmt = this.$statement;

    // 1. Let V be undefined.
    let V: $Any = intrinsics.undefined;

    // 2. Repeat,
    while (true) {
      // 2. a. Let exprRef be the result of evaluating Expression.
      const exprRef = expr.Evaluate(ctx);

      // 2. b. Let exprValue be ? GetValue(exprRef).
      const exprValue = exprRef.GetValue(ctx);
      if (exprValue.isAbrupt) { return exprValue.enrichWith(ctx, this); }

      // 2. c. If ToBoolean(exprValue) is false, return NormalCompletion(V).
      const bool = exprValue.ToBoolean(ctx);
      if (bool.isAbrupt) { return bool.enrichWith(ctx, this); }
      if (bool.isFalsey) {
        return V.ToCompletion(CompletionType.normal, intrinsics.empty);
      }

      // 2. d. Let stmtResult be the result of evaluating Statement.
      const stmtResult = evaluateStatement(ctx, stmt);

      // 2. e. If LoopContinues(stmtResult, labelSet) is false, return Completion(UpdateEmpty(stmtResult, V)).
      if ($LoopContinues(ctx, stmtResult, labelSet).isFalsey) {
        return stmtResult.UpdateEmpty(V);
      }

      // 2. f. If stmtResult.[[Value]] is not empty, set V to stmtResult.[[Value]].
      if (!stmtResult.isEmpty) {
        V = stmtResult;
      }
    }
  }
}

export type $$Initializer = (
  $$AssignmentExpressionOrHigher |
  $VariableDeclarationList
);

export class $ForStatement implements I$Node {
  public get $kind(): SyntaxKind.ForStatement { return SyntaxKind.ForStatement; }

  public readonly $initializer: $$Initializer | undefined;
  public readonly $condition: $$AssignmentExpressionOrHigher | undefined;
  public readonly $incrementor: $$AssignmentExpressionOrHigher | undefined;
  public readonly $statement: $$ESLabelledItem;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-for-statement-static-semantics-vardeclarednames
  // 13.7.4.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-for-statement-static-semantics-varscopeddeclarations
  // 13.7.4.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: ForStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ForStatement`,
  ) {
    this.$condition = $assignmentExpression(node.condition as $AssignmentExpressionNode, this, ctx, -1);
    this.$incrementor = $assignmentExpression(node.incrementor as $AssignmentExpressionNode, this, ctx, -1);
    const $statement = this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx, -1);

    if (node.initializer === void 0) {
      this.$initializer = void 0;

      this.VarDeclaredNames = $statement.VarDeclaredNames;
      this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    } else {
      if (node.initializer.kind === SyntaxKind.VariableDeclarationList) {
        const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx);
        if ($initializer.isLexical) {
          this.VarDeclaredNames = $statement.VarDeclaredNames;
          this.VarScopedDeclarations = $statement.VarScopedDeclarations;
        } else {
          this.VarDeclaredNames = [
            ...$initializer.VarDeclaredNames,
            ...$statement.VarDeclaredNames,
          ];
          this.VarScopedDeclarations = [
            ...$initializer.VarScopedDeclarations,
            ...$statement.VarScopedDeclarations,
          ];
        }
      } else {
        this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx, -1);

        this.VarDeclaredNames = $statement.VarDeclaredNames;
        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
      }
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-for-statement-runtime-semantics-labelledevaluation
  // 13.7.4.7 Runtime Semantics: LabelledEvaluation
  public EvaluateLabelled(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
    // IterationStatement : for ( Expression opt ; Expression opt ; Expression opt ) Statement

    // 1. If the first Expression is present, then
    // 1. a. Let exprRef be the result of evaluating the first Expression.
    // 1. b. Perform ? GetValue(exprRef).
    // 2. Return ? ForBodyEvaluation(the second Expression, the third Expression, Statement, « », labelSet).

    // IterationStatement : for ( var VariableDeclarationList ; Expression opt ; Expression opt ) Statement

    // 1. Let varDcl be the result of evaluating VariableDeclarationList.
    // 2. ReturnIfAbrupt(varDcl).
    // 3. Return ? ForBodyEvaluation(the first Expression, the second Expression, Statement, « », labelSet).

    // IterationStatement : for ( LexicalDeclaration Expression opt ; Expression opt ) Statement

    // 1. Let oldEnv be the running execution context's LexicalEnvironment.
    // 2. Let loopEnv be NewDeclarativeEnvironment(oldEnv).
    // 3. Let loopEnvRec be loopEnv's EnvironmentRecord.
    // 4. Let isConst be the result of performing IsConstantDeclaration of LexicalDeclaration.
    // 5. Let boundNames be the BoundNames of LexicalDeclaration.
    // 6. For each element dn of boundNames, do
    // 6. a. If isConst is true, then
    // 6. a. i. Perform ! loopEnvRec.CreateImmutableBinding(dn, true).
    // 6. b. Else,
    // 6. b. i. Perform ! loopEnvRec.CreateMutableBinding(dn, false).
    // 7. Set the running execution context's LexicalEnvironment to loopEnv.
    // 8. Let forDcl be the result of evaluating LexicalDeclaration.
    // 9. If forDcl is an abrupt completion, then
    // 9. a. Set the running execution context's LexicalEnvironment to oldEnv.
    // 9. b. Return Completion(forDcl).
    // 10. If isConst is false, let perIterationLets be boundNames; otherwise let perIterationLets be « ».
    // 11. Let bodyResult be ForBodyEvaluation(the first Expression, the second Expression, Statement, perIterationLets, labelSet).
    // 12. Set the running execution context's LexicalEnvironment to oldEnv.
    // 13. Return Completion(bodyResult).

    return intrinsics.empty; // TODO: implement this
  }
}

export class $ForInStatement implements I$Node {
  public get $kind(): SyntaxKind.ForInStatement { return SyntaxKind.ForInStatement; }

  public readonly $initializer: $$Initializer;
  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESLabelledItem;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-static-semantics-vardeclarednames
  // 13.7.5.7 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-static-semantics-varscopeddeclarations
  // 13.7.5.8 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: ForInStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ForInStatement`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
    const $statement = this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx, -1);

    if (node.initializer.kind === SyntaxKind.VariableDeclarationList) {
      const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx);
      if ($initializer.isLexical) {
        this.BoundNames = $initializer.BoundNames;
        this.VarDeclaredNames = $statement.VarDeclaredNames;
        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
      } else {
        this.BoundNames = emptyArray;
        this.VarDeclaredNames = [
          ...$initializer.VarDeclaredNames,
          ...$statement.VarDeclaredNames,
        ];
        this.VarScopedDeclarations = [
          ...$initializer.VarScopedDeclarations,
          ...$statement.VarScopedDeclarations,
        ];
      }
    } else {
      this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx, -1);

      this.BoundNames = emptyArray;
      this.VarDeclaredNames = $statement.VarDeclaredNames;
      this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-runtime-semantics-labelledevaluation
  // 13.7.5.11 Runtime Semantics: LabelledEvaluation
  public EvaluateLabelled(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
    // IterationStatement : for ( LeftHandSideExpression in Expression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », Expression, enumerate).
    // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, enumerate, assignment, labelSet).

    // IterationStatement : for ( var ForBinding in Expression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », Expression, enumerate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, enumerate, varBinding, labelSet).

    // IterationStatement : for ( ForDeclaration in Expression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, Expression, enumerate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, enumerate, lexicalBinding, labelSet).

    // IterationStatement : for ( LeftHandSideExpression of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, iterate, assignment, labelSet).

    // IterationStatement : for ( var ForBinding of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet).

    // IterationStatement : for ( ForDeclaration of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, AssignmentExpression, iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, iterate, lexicalBinding, labelSet).

    // IterationStatement : for await ( LeftHandSideExpression of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, async-iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, iterate, assignment, labelSet, async).

    // IterationStatement : for await ( var ForBinding of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, async-iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet, async).

    // IterationStatement : for await ( ForDeclaration of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, AssignmentExpression, async-iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, iterate, lexicalBinding, labelSet, async).

    return intrinsics.empty; // TODO: implement this
  }

  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-runtime-semantics-evaluation
  // 13.7.5.14 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // ForBinding : BindingIdentifier

    // 1. Let bindingId be StringValue of BindingIdentifier.
    // 2. Return ? ResolveBinding(bindingId).

    return intrinsics.empty; // TODO: implement this
  }
}

export class $ForOfStatement implements I$Node {
  public get $kind(): SyntaxKind.ForOfStatement { return SyntaxKind.ForOfStatement; }

  public readonly $initializer: $$Initializer;
  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESLabelledItem;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-static-semantics-vardeclarednames
  // 13.7.5.7 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-static-semantics-varscopeddeclarations
  // 13.7.5.8 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: ForOfStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ForOfStatement`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
    const $statement = this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx, -1);

    if (node.initializer.kind === SyntaxKind.VariableDeclarationList) {
      const $initializer = this.$initializer = new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx);
      if ($initializer.isLexical) {
        this.BoundNames = $initializer.BoundNames;
        this.VarDeclaredNames = $statement.VarDeclaredNames;
        this.VarScopedDeclarations = $statement.VarScopedDeclarations;
      } else {
        this.BoundNames = emptyArray;
        this.VarDeclaredNames = [
          ...$initializer.VarDeclaredNames,
          ...$statement.VarDeclaredNames,
        ];
        this.VarScopedDeclarations = [
          ...$initializer.VarScopedDeclarations,
          ...$statement.VarScopedDeclarations,
        ];
      }
    } else {
      this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx, -1);

      this.BoundNames = emptyArray;
      this.VarDeclaredNames = $statement.VarDeclaredNames;
      this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-runtime-semantics-labelledevaluation
  // 13.7.5.11 Runtime Semantics: LabelledEvaluation
  public EvaluateLabelled(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
    // IterationStatement : for ( LeftHandSideExpression in Expression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », Expression, enumerate).
    // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, enumerate, assignment, labelSet).

    // IterationStatement : for ( var ForBinding in Expression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », Expression, enumerate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, enumerate, varBinding, labelSet).

    // IterationStatement : for ( ForDeclaration in Expression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, Expression, enumerate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, enumerate, lexicalBinding, labelSet).

    // IterationStatement : for ( LeftHandSideExpression of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, iterate, assignment, labelSet).

    // IterationStatement : for ( var ForBinding of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet).

    // IterationStatement : for ( ForDeclaration of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, AssignmentExpression, iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, iterate, lexicalBinding, labelSet).

    // IterationStatement : for await ( LeftHandSideExpression of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, async-iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(LeftHandSideExpression, Statement, keyResult, iterate, assignment, labelSet, async).

    // IterationStatement : for await ( var ForBinding of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(« », AssignmentExpression, async-iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForBinding, Statement, keyResult, iterate, varBinding, labelSet, async).

    // IterationStatement : for await ( ForDeclaration of AssignmentExpression ) Statement

    // 1. Let keyResult be ? ForIn/OfHeadEvaluation(BoundNames of ForDeclaration, AssignmentExpression, async-iterate).
    // 2. Return ? ForIn/OfBodyEvaluation(ForDeclaration, Statement, keyResult, iterate, lexicalBinding, labelSet, async).

    return intrinsics.empty; // TODO: implement this
  }

  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-runtime-semantics-evaluation
  // 13.7.5.14 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }
}

export class $ContinueStatement implements I$Node {
  public get $kind(): SyntaxKind.ContinueStatement { return SyntaxKind.ContinueStatement; }

  public readonly $label: $Identifier | undefined;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
  // 13.1.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  // 13.1.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;

  public constructor(
    public readonly node: ContinueStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ContinueStatement`,
  ) {
    this.$label = $identifier(node.label, this, ctx | Context.IsLabelReference, -1);
  }

  // http://www.ecma-international.org/ecma-262/#sec-continue-statement-runtime-semantics-evaluation
  // 13.8.3 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Empty {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // ContinueStatement : continue ;

    // 1. Return Completion { [[Type]]: continue, [[Value]]: empty, [[Target]]: empty }.
    if (this.$label === void 0) {
      return new $Empty(realm, CompletionType.continue, intrinsics.empty, this);
    }

    // ContinueStatement : continue LabelIdentifier ;

    // 1. Let label be the StringValue of LabelIdentifier.
    // 2. Return Completion { [[Type]]: continue, [[Value]]: empty, [[Target]]: label }.
    return new $Empty(realm, CompletionType.continue, this.$label.StringValue, this);
  }
}

export class $BreakStatement implements I$Node {
  public get $kind(): SyntaxKind.BreakStatement { return SyntaxKind.BreakStatement; }

  public readonly $label: $Identifier | undefined;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
  // 13.1.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  // 13.1.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;

  public constructor(
    public readonly node: BreakStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.BreakStatement`,
  ) {
    this.$label = $identifier(node.label, this, ctx | Context.IsLabelReference, -1);
  }

  // http://www.ecma-international.org/ecma-262/#sec-break-statement-runtime-semantics-evaluation
  // 13.9.3 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // BreakStatement : break ;

    // 1. Return Completion { [[Type]]: break, [[Value]]: empty, [[Target]]: empty }.
    if (this.$label === void 0) {
      return new $Empty(realm, CompletionType.break, intrinsics.empty, this);
    }

    // BreakStatement : break LabelIdentifier ;

    // 1. Let label be the StringValue of LabelIdentifier.
    // 2. Return Completion { [[Type]]: break, [[Value]]: empty, [[Target]]: label }.
    return new $Empty(realm, CompletionType.break, this.$label.StringValue, this);
  }
}

export class $ReturnStatement implements I$Node {
  public get $kind(): SyntaxKind.ReturnStatement { return SyntaxKind.ReturnStatement; }

  public readonly $expression: $$AssignmentExpressionOrHigher | undefined;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
  // 13.1.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  // 13.1.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;

  public constructor(
    public readonly node: ReturnStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ReturnStatement`,
  ) {
    if (node.expression === void 0) {
      this.$expression = void 0;
    } else {
      this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-return-statement
  // 13.10 The return Statement
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // ReturnStatement : return ;

    // 1. Return Completion { [[Type]]: return, [[Value]]: undefined, [[Target]]: empty }.
    if (this.$expression === void 0) {
      return new $Undefined(realm, CompletionType.return);
    }

    // ReturnStatement : return Expression ;

    // 1. Let exprRef be the result of evaluating Expression.
    const exprRef = this.$expression.Evaluate(ctx);

    // 2. Let exprValue be ? GetValue(exprRef).
    const exprValue = exprRef.GetValue(ctx);
    if (exprValue.isAbrupt) { return exprValue.enrichWith(ctx, this); }

    // 3. If ! GetGeneratorKind() is async, set exprValue to ? Await(exprValue). // TODO

    // 4. Return Completion { [[Type]]: return, [[Value]]: exprValue, [[Target]]: empty }.
    return exprValue.ToCompletion(CompletionType.return, intrinsics.empty);
  }
}

export class $WithStatement implements I$Node {
  public get $kind(): SyntaxKind.WithStatement { return SyntaxKind.WithStatement; }

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESLabelledItem;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-with-statement-static-semantics-vardeclarednames
  // 13.11.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-with-statement-static-semantics-varscopeddeclarations
  // 13.11.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: WithStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.WithStatement`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
    const $statement = this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx, -1);

    this.VarDeclaredNames = $statement.VarDeclaredNames;
    this.VarScopedDeclarations = $statement.VarScopedDeclarations;
  }

  // http://www.ecma-international.org/ecma-262/#sec-with-statement-runtime-semantics-evaluation
  // 13.11.7 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // WithStatement : with ( Expression ) Statement

    // 1. Let val be the result of evaluating Expression.
    // 2. Let obj be ? ToObject(? GetValue(val)).
    // 3. Let oldEnv be the running execution context's LexicalEnvironment.
    // 4. Let newEnv be NewObjectEnvironment(obj, oldEnv).
    // 5. Set the withEnvironment flag of newEnv's EnvironmentRecord to true.
    // 6. Set the running execution context's LexicalEnvironment to newEnv.
    // 7. Let C be the result of evaluating Statement.
    // 8. Set the running execution context's LexicalEnvironment to oldEnv.
    // 9. Return Completion(UpdateEmpty(C, undefined)).

    return intrinsics.empty; // TODO: implement this
  }
}

export class $SwitchStatement implements I$Node {
  public get $kind(): SyntaxKind.SwitchStatement { return SyntaxKind.SwitchStatement; }

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $caseBlock: $CaseBlock;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-lexicallydeclarednames
  // 13.12.5 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-lexicallyscopeddeclarations
  // 13.12.6 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-vardeclarednames
  // 13.12.7 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  // 13.12.8 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: SwitchStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.SwitchStatement`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
    const $caseBlock = this.$caseBlock = new $CaseBlock(node.caseBlock, this, ctx);

    this.LexicallyDeclaredNames = $caseBlock.LexicallyDeclaredNames;
    this.LexicallyScopedDeclarations = $caseBlock.LexicallyScopedDeclarations;
    this.VarDeclaredNames = $caseBlock.VarDeclaredNames;
    this.VarScopedDeclarations = $caseBlock.VarScopedDeclarations;
  }

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-runtime-semantics-evaluation
  // 13.12.11 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    const realm = ctx.Realm;
    // SwitchStatement : switch ( Expression ) CaseBlock

    // 1. Let exprRef be the result of evaluating Expression.
    // 2. Let switchValue be ? GetValue(exprRef).
    const switchValue = this.$expression.Evaluate(ctx).GetValue(ctx);
    if (switchValue.isAbrupt) { return switchValue.enrichWith(ctx, this); }

    // 3. Let oldEnv be the running execution context's LexicalEnvironment.
    const oldEnv = ctx.LexicalEnvironment;

    // 4. Let blockEnv be NewDeclarativeEnvironment(oldEnv).
    const blockEnv = ctx.LexicalEnvironment = new $DeclarativeEnvRec(this.logger, realm, oldEnv);

    // 5. Perform BlockDeclarationInstantiation(CaseBlock, blockEnv).
    const $BlockDeclarationInstantiationResult = BlockDeclarationInstantiation(ctx, this.LexicallyScopedDeclarations, blockEnv);
    if ($BlockDeclarationInstantiationResult.isAbrupt) { return $BlockDeclarationInstantiationResult; }

    // 6. Set the running execution context's LexicalEnvironment to blockEnv.
    realm.stack.push(ctx);

    // 7. Let R be the result of performing CaseBlockEvaluation of CaseBlock with argument switchValue.
    const R = this.EvaluateCaseBlock(ctx, switchValue);

    // 8. Set the running execution context's LexicalEnvironment to oldEnv.
    realm.stack.pop();
    ctx.LexicalEnvironment = oldEnv;

    // 9. Return R.
    return R;
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-caseblockevaluation
  // 13.12.9 Runtime Semantics: CaseBlockEvaluation
  private EvaluateCaseBlock(
    ctx: ExecutionContext,
    switchValue: $Any,
  ) {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    const { $caseBlock: { $clauses: clauses } } = this;
    const { undefined: $undefined, empty } = realm['[[Intrinsics]]'];
    // CaseBlock : { }
    // 1. Return NormalCompletion(undefined).
    if (clauses.length === 0) {
      return new $Undefined(realm);
    }

    let V: $Any = $undefined;
    const defaultClauseIndex: number = clauses.findIndex((clause) => clause.$kind === SyntaxKind.DefaultClause);
    class CaseClausesEvaluationResult {
      public constructor(public result: $Any, public found: boolean, public isAbrupt: boolean) { }
    }
    const evaluateCaseClauses = (inclusiveStartIndex: number, exclusiveEndIndex: number, found = false) => {
      // 1. Let V be undefined.
      // 2. Let A be the List of CaseClause items in CaseClauses, in source text order.
      // 3. Let found be false.
      // 4. For each CaseClause C in A, do
      for (let i = inclusiveStartIndex; i < exclusiveEndIndex; i++) {
        const C = clauses[i] as $CaseClause;
        // 4. a. If found is false, then
        if (!found) {
          // 4. a. i. Set found to ? CaseClauseIsSelected(C, input).
          found = this.IsCaseClauseSelected(ctx, C, switchValue);
        }
        // 4. b. If found is true, then
        if (found) {
          // 4. b. i. Let R be the result of evaluating C.
          const R = evaluateStatementList(ctx, C.$statements);

          // 4. b. ii. If R.[[Value]] is not empty, set V to R.[[Value]].
          if (R.hasValue) {
            V = R;
          }
          // 4. b. iii. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
          if (R.isAbrupt) {
            return new CaseClausesEvaluationResult(R.enrichWith(ctx, this).UpdateEmpty(V), found, true);
          }
        }
      }
      // 5. Return NormalCompletion(V).
      return new CaseClausesEvaluationResult(
        V.ToCompletion(CompletionType.normal, intrinsics.empty),
        found,
        false,
      );
    };

    // CaseBlock : { CaseClauses }
    if (defaultClauseIndex === -1) {
      return evaluateCaseClauses(0, clauses.length).result;
    }

    // CaseBlock : { CaseClauses opt DefaultClause CaseClauses opt }
    // 1. Let V be undefined.
    // 2. If the first CaseClauses is present, then
    // 2. a. Let A be the List of CaseClause items in the first CaseClauses, in source text order.
    // 3. Else,
    // 3. a. Let A be « ».
    // 4. Let found be false.
    // 5. For each CaseClause C in A, do
    // 5. a. If found is false, then
    // 5. a. i. Set found to ? CaseClauseIsSelected(C, input).
    // 5. b. If found is true, then
    // 5. b. i. Let R be the result of evaluating C.
    // 5. b. ii. If R.[[Value]] is not empty, set V to R.[[Value]].
    // 5. b. iii. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
    let { result, found, isAbrupt } = evaluateCaseClauses(0, defaultClauseIndex);
    if (isAbrupt) {
      return result;
    }
    // 6. Let foundInB be false.
    // 7. If the second CaseClauses is present, then
    // 7. a. Let B be the List of CaseClause items in the second CaseClauses, in source text order.
    // 8. Else,
    // 8. a. Let B be « ».
    // 9. If found is false, then
    if (!found) {
      // 9. a. For each CaseClause C in B, do
      // 9. a. i. If foundInB is false, then
      // 9. a. i. 1. Set foundInB to ? CaseClauseIsSelected(C, input).
      // 9. a. ii. If foundInB is true, then
      // 9. a. ii. 1. Let R be the result of evaluating CaseClause C.
      // 9. a. ii. 2. If R.[[Value]] is not empty, set V to R.[[Value]].
      // 9. a. ii. 3. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
      // 10. If foundInB is true, return NormalCompletion(V).
      ({ result, isAbrupt, found } = evaluateCaseClauses(defaultClauseIndex + 1, clauses.length));
      if (isAbrupt || found) {
        return result;
      }
    }
    // 11. Let R be the result of evaluating DefaultClause.
    // 12. If R.[[Value]] is not empty, set V to R.[[Value]].
    // 13. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
    ({ result, isAbrupt } = evaluateCaseClauses(defaultClauseIndex, defaultClauseIndex + 1, true));
    if (isAbrupt) {
      return result;
    }
    // 14. For each CaseClause C in B (NOTE: this is another complete iteration of the second CaseClauses), do
    // 14. a. Let R be the result of evaluating CaseClause C.
    // 14. b. If R.[[Value]] is not empty, set V to R.[[Value]].
    // 14. c. If R is an abrupt completion, return Completion(UpdateEmpty(R, V)).
    // 15. Return NormalCompletion(V).
    return evaluateCaseClauses(defaultClauseIndex + 1, clauses.length, true).result;
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-caseclauseisselected
  // 13.12.10 Runtime Semantics: CaseClauseIsSelected ( C , input )
  private IsCaseClauseSelected(
    ctx: ExecutionContext,
    clause: $CaseClause,
    switchValue: $Any,
  ): boolean {
    ctx.checkTimeout();

    // 1. Assert: C is an instance of the production CaseClause:caseExpression:StatementListopt .
    // 2. Let exprRef be the result of evaluating the Expression of C.
    // 3. Let clauseSelector be ? GetValue(exprRef).
    // 4. Return the result of performing Strict Equality Comparison input === clauseSelector.
    return clause.$expression.Evaluate(ctx).GetValue(ctx)['[[Value]]'] === switchValue['[[Value]]'];
  }
}

export class $LabeledStatement implements I$Node {
  public get $kind(): SyntaxKind.LabeledStatement { return SyntaxKind.LabeledStatement; }

  public readonly $label: $Identifier;
  public readonly $statement: $$ESLabelledItem;

  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-lexicallydeclarednames
  // 13.13.6 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-lexicallyscopeddeclarations
  // 13.13.7 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-toplevellexicallydeclarednames
  // 13.13.8 Static Semantics: TopLevelLexicallyDeclaredNames
  public readonly TopLevelLexicallyDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-toplevellexicallyscopeddeclarations
  // 13.13.9 Static Semantics: TopLevelLexicallyScopedDeclarations
  public readonly TopLevelLexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-toplevelvardeclarednames
  // 13.13.10 Static Semantics: TopLevelVarDeclaredNames
  public readonly TopLevelVarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-toplevelvarscopeddeclarations
  // 13.13.11 Static Semantics: TopLevelVarScopedDeclarations
  public readonly TopLevelVarScopedDeclarations: readonly $$ESVarDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-vardeclarednames
  // 13.13.12 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-varscopeddeclarations
  // 13.13.13 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: LabeledStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.LabeledStatement`,
  ) {
    this.$label = $identifier(node.label, this, ctx | Context.IsLabel, -1);
    const $statement = this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx, -1);

    if ($statement.$kind === SyntaxKind.FunctionDeclaration) {
      this.LexicallyDeclaredNames = $statement.BoundNames;
      this.LexicallyScopedDeclarations = [$statement];
      this.TopLevelVarDeclaredNames = $statement.BoundNames;
      this.TopLevelVarScopedDeclarations = [$statement];
      this.VarDeclaredNames = emptyArray;
      this.VarScopedDeclarations = emptyArray;
    } else {
      this.LexicallyDeclaredNames = emptyArray;
      this.LexicallyScopedDeclarations = emptyArray;
      if ($statement.$kind === SyntaxKind.LabeledStatement) {
        this.TopLevelVarDeclaredNames = $statement.TopLevelVarDeclaredNames;
        this.TopLevelVarScopedDeclarations = $statement.TopLevelVarScopedDeclarations;
      } else {
        this.TopLevelVarDeclaredNames = $statement.VarDeclaredNames;
        this.TopLevelVarScopedDeclarations = $statement.VarScopedDeclarations;
      }
      this.VarDeclaredNames = $statement.VarDeclaredNames;
      this.VarScopedDeclarations = $statement.VarScopedDeclarations;
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-runtime-semantics-labelledevaluation
  // 13.13.14 Runtime Semantics: LabelledEvaluation
  public EvaluateLabelled(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.EvaluateLabelled(#${ctx.id})`);
    // LabelledStatement : LabelIdentifier : LabelledItem

    // 1. Let label be the StringValue of LabelIdentifier.
    // 2. Append label as an element of labelSet.
    // 3. Let stmtResult be LabelledEvaluation of LabelledItem with argument labelSet.
    // 4. If stmtResult.[[Type]] is break and SameValue(stmtResult.[[Target]], label) is true, then
    // 4. a. Set stmtResult to NormalCompletion(stmtResult.[[Value]]).
    // 5. Return Completion(stmtResult).

    // LabelledItem : Statement

    // 1. If Statement is either a LabelledStatement or a BreakableStatement, then
    // 1. a. Return LabelledEvaluation of Statement with argument labelSet.
    // 2. Else,
    // 2. a. Return the result of evaluating Statement.

    // LabelledItem : FunctionDeclaration

    // 1. Return the result of evaluating FunctionDeclaration.

    return intrinsics.undefined; // TODO: implement this
  }

  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-runtime-semantics-evaluation
  // 13.13.15 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // LabelledStatement : LabelIdentifier : LabelledItem

    // 1. Let newLabelSet be a new empty List.
    // 2. Return LabelledEvaluation of this LabelledStatement with argument newLabelSet.

    return intrinsics.undefined; // TODO: implement this
  }
}

export class $ThrowStatement implements I$Node {
  public get $kind(): SyntaxKind.ThrowStatement { return SyntaxKind.ThrowStatement; }

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
  // 13.1.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  // 13.1.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;

  public constructor(
    public readonly node: ThrowStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ThrowStatement`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
  }

  // http://www.ecma-international.org/ecma-262/#sec-throw-statement-runtime-semantics-evaluation
  // 13.14.1 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // ThrowStatement : throw Expression ;

    // 1. Let exprRef be the result of evaluating Expression.
    const exprRef = this.$expression.Evaluate(ctx);

    // 2. Let exprValue be ? GetValue(exprRef).
    const exprValue = exprRef.GetValue(ctx);
    if (exprValue.isAbrupt) { return exprValue.enrichWith(ctx, this); }

    // 3. Return ThrowCompletion(exprValue).
    return exprValue.ToCompletion(CompletionType.throw, intrinsics.empty);
  }
}

export class $TryStatement implements I$Node {
  public get $kind(): SyntaxKind.TryStatement { return SyntaxKind.TryStatement; }

  public readonly $tryBlock: $Block;
  public readonly $catchClause: $CatchClause | undefined;
  public readonly $finallyBlock: $Block | undefined;

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-try-statement-static-semantics-vardeclarednames
  // 13.15.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-try-statement-static-semantics-varscopeddeclarations
  // 13.15.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public constructor(
    public readonly node: TryStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.TryStatement`,
  ) {
    const $tryBlock = this.$tryBlock = new $Block(node.tryBlock, this, ctx, -1);
    if (node.catchClause === void 0) {
      // finallyBlock must be defined
      this.$catchClause = void 0;
      const $finallyBlock = this.$finallyBlock = new $Block(node.finallyBlock!, this, ctx, -1);

      this.VarDeclaredNames = [
        ...$tryBlock.VarDeclaredNames,
        ...$finallyBlock.VarDeclaredNames,
      ];
      this.VarScopedDeclarations = [
        ...$tryBlock.VarScopedDeclarations,
        ...$finallyBlock.VarScopedDeclarations,
      ];
    } else if (node.finallyBlock === void 0) {
      // catchClause must be defined
      const $catchClause = this.$catchClause = new $CatchClause(node.catchClause!, this, ctx);
      this.$finallyBlock = void 0;

      this.VarDeclaredNames = [
        ...$tryBlock.VarDeclaredNames,
        ...$catchClause.VarDeclaredNames,
      ];
      this.VarScopedDeclarations = [
        ...$tryBlock.VarScopedDeclarations,
        ...$catchClause.VarScopedDeclarations,
      ];
    } else {
      const $catchClause = this.$catchClause = new $CatchClause(node.catchClause!, this, ctx);
      const $finallyBlock = this.$finallyBlock = new $Block(node.finallyBlock!, this, ctx, -1);

      this.VarDeclaredNames = [
        ...$tryBlock.VarDeclaredNames,
        ...$catchClause.VarDeclaredNames,
        ...$finallyBlock.VarDeclaredNames,
      ];
      this.VarScopedDeclarations = [
        ...$tryBlock.VarScopedDeclarations,
        ...$catchClause.VarScopedDeclarations,
        ...$finallyBlock.VarScopedDeclarations,
      ];
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-try-statement-runtime-semantics-evaluation
  // 13.15.8 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    const realm = ctx.Realm;
    // TryStatement : try Block Catch

    // 1. Let B be the result of evaluating Block.
    // 2. If B.[[Type]] is throw, let C be CatchClauseEvaluation of Catch with argument B.[[Value]].
    // 3. Else, let C be B.
    // 4. Return Completion(UpdateEmpty(C, undefined)).

    // TryStatement : try Block Finally

    // 1. Let B be the result of evaluating Block.
    // 2. Let F be the result of evaluating Finally.
    // 3. If F.[[Type]] is normal, set F to B.
    // 4. Return Completion(UpdateEmpty(F, undefined)).

    // TryStatement : try Block Catch Finally

    // 1. Let B be the result of evaluating Block.
    // 2. If B.[[Type]] is throw, let C be CatchClauseEvaluation of Catch with argument B.[[Value]].
    // 3. Else, let C be B.
    // 4. Let F be the result of evaluating Finally.
    // 5. If F.[[Type]] is normal, set F to C.
    // 6. Return Completion(UpdateEmpty(F, undefined)).

    let result = this.$tryBlock.Evaluate(ctx);

    if (this.$catchClause !== void 0) {
      result = result['[[Type]]'] === CompletionType.throw ? this.EvaluateCatchClause(ctx, result.GetValue(ctx) as $AnyNonEmpty) : result; // TODO: fix types
    }
    const $finallyBlock = this.$finallyBlock;
    if ($finallyBlock !== void 0) {
      const F = $finallyBlock.Evaluate(ctx);
      result = F['[[Type]]'] !== CompletionType.normal ? F : result;
    }
    result.UpdateEmpty(realm['[[Intrinsics]]'].undefined);

    return result as $AnyNonEmpty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-catchclauseevaluation
  // 13.15.7 Runtime Semantics: CatchClauseEvaluation
  private EvaluateCatchClause(
    ctx: ExecutionContext,
    thrownValue: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const catchClause = this.$catchClause;
    const varDeclarations = catchClause?.$variableDeclaration;
    const hasCatchParamteres = varDeclarations !== void 0;

    // Catch : catch Block

    // 1. Return the result of evaluating Block.

    // Catch : catch ( CatchParameter ) Block

    // 1. Let oldEnv be the running execution context's LexicalEnvironment.
    const oldEnv = ctx.LexicalEnvironment;

    if (hasCatchParamteres) {
      // 2. Let catchEnv be NewDeclarativeEnvironment(oldEnv).
      // 3. Let catchEnvRec be catchEnv's EnvironmentRecord.
      ctx.LexicalEnvironment = new $DeclarativeEnvRec(this.logger, realm, oldEnv);

      // 4. For each element argName of the BoundNames of CatchParameter, do
      // 4. a. Perform ! catchEnvRec.CreateMutableBinding(argName, false).
      catchClause?.CreateBinding(ctx, realm);

      // 5. Set the running execution context's LexicalEnvironment to catchEnv.
      realm.stack.push(ctx);

      // 6. Let status be the result of performing BindingInitialization for CatchParameter passing thrownValue and catchEnv as arguments.
      const status = varDeclarations?.InitializeBinding(ctx, thrownValue);

      // 7. If status is an abrupt completion, then
      if (status?.isAbrupt) {
        // 7. a. Set the running execution context's LexicalEnvironment to oldEnv.
        realm.stack.pop();
        ctx.LexicalEnvironment = oldEnv;

        // 7. b. Return Completion(status).
        return status;
      }
    }
    // 8. Let B be the result of evaluating Block.
    const B = catchClause?.$block.Evaluate(ctx);

    // 9. Set the running execution context's LexicalEnvironment to oldEnv.
    if (hasCatchParamteres) {
      realm.stack.pop();
      ctx.LexicalEnvironment = oldEnv;
    }

    // 10. Return Completion(B).
    return B as $AnyNonEmpty; // TODO fix typings
  }
}

export class $DebuggerStatement implements I$Node {
  public get $kind(): SyntaxKind.DebuggerStatement { return SyntaxKind.DebuggerStatement; }

  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-vardeclarednames
  // 13.1.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  // 13.1.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;

  public constructor(
    public readonly node: DebuggerStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.DebuggerStatement`,
  ) {}

  // http://www.ecma-international.org/ecma-262/#sec-debugger-statement-runtime-semantics-evaluation
  // 13.16.1 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // DebuggerStatement : debugger ;

    // 1. If an implementation-defined debugging facility is available and enabled, then
    // 1. a. Perform an implementation-defined debugging action.
    // 1. b. Let result be an implementation-defined Completion value.
    // 2. Else,
    // 2. a. Let result be NormalCompletion(empty).
    // 3. Return result.

    return intrinsics.empty; // TODO: implement this
  }
}

// #endregion

// #region Statement members

export type $$CaseOrDefaultClause = $CaseClause | $DefaultClause;

export function $$clauseList(
  nodes: readonly CaseOrDefaultClause[],
  parent: $CaseBlock,
  ctx: Context,
): readonly $$CaseOrDefaultClause[] {
  const len = nodes.length;
  let node: CaseOrDefaultClause;
  const $nodes: $$CaseOrDefaultClause[] = [];

  for (let i = 0; i < len; ++i) {
    node = nodes[i];
    switch (node.kind) {
      case SyntaxKind.CaseClause:
        $nodes[i] = new $CaseClause(node, parent, ctx, i);
        break;
      case SyntaxKind.DefaultClause:
        $nodes[i] = new $DefaultClause(node, parent, ctx, i);
        break;
    }
  }
  return $nodes;
}

export class $CaseBlock implements I$Node {
  public get $kind(): SyntaxKind.CaseBlock { return SyntaxKind.CaseBlock; }

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-lexicallydeclarednames
  // 13.12.5 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-lexicallyscopeddeclarations
  // 13.12.6 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-vardeclarednames
  // 13.12.7 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  // 13.12.8 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly $clauses: readonly $$CaseOrDefaultClause[];

  public constructor(
    public readonly node: CaseBlock,
    public readonly parent: $SwitchStatement,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.CaseBlock`,
  ) {
    const $clauses = this.$clauses = $$clauseList(node.clauses, this, ctx);

    this.LexicallyDeclaredNames = $clauses.flatMap(getLexicallyDeclaredNames);
    this.LexicallyScopedDeclarations = $clauses.flatMap(getLexicallyScopedDeclarations);
    this.VarDeclaredNames = $clauses.flatMap(getVarDeclaredNames);
    this.VarScopedDeclarations = $clauses.flatMap(getVarScopedDeclarations);
  }
}

export class $CaseClause implements I$Node {
  public get $kind(): SyntaxKind.CaseClause { return SyntaxKind.CaseClause; }

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-lexicallydeclarednames
  // 13.12.5 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-lexicallyscopeddeclarations
  // 13.12.6 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-vardeclarednames
  // 13.12.7 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  // 13.12.8 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statements: readonly $$TSStatementListItem[];

  public constructor(
    public readonly node: CaseClause,
    public readonly parent: $CaseBlock,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.CaseClause`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
    const $statements = this.$statements = $$tsStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);

    this.LexicallyDeclaredNames = $statements.flatMap(getLexicallyDeclaredNames);
    this.LexicallyScopedDeclarations = $statements.flatMap(getLexicallyScopedDeclarations);
    this.VarDeclaredNames = $statements.flatMap(getVarDeclaredNames);
    this.VarScopedDeclarations = $statements.flatMap(getVarScopedDeclarations);
  }
}

export class $DefaultClause implements I$Node {
  public get $kind(): SyntaxKind.DefaultClause { return SyntaxKind.DefaultClause; }

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-lexicallydeclarednames
  // 13.12.5 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-lexicallyscopeddeclarations
  // 13.12.6 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-vardeclarednames
  // 13.12.7 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-varscopeddeclarations
  // 13.12.8 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly $statements: readonly $$TSStatementListItem[];

  public constructor(
    public readonly node: DefaultClause,
    public readonly parent: $CaseBlock,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.DefaultClause`,
  ) {
    const $statements = this.$statements = $$tsStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);

    this.LexicallyDeclaredNames = $statements.flatMap(getLexicallyDeclaredNames);
    this.LexicallyScopedDeclarations = $statements.flatMap(getLexicallyScopedDeclarations);
    this.VarDeclaredNames = $statements.flatMap(getVarDeclaredNames);
    this.VarScopedDeclarations = $statements.flatMap(getVarScopedDeclarations);
  }
}

export class $CatchClause implements I$Node {
  public get $kind(): SyntaxKind.CatchClause { return SyntaxKind.CatchClause; }

  // http://www.ecma-international.org/ecma-262/#sec-try-statement-static-semantics-vardeclarednames
  // 13.15.5 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-try-statement-static-semantics-varscopeddeclarations
  // 13.15.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly $variableDeclaration: $VariableDeclaration | undefined;
  public readonly $block: $Block;

  public constructor(
    public readonly node: CatchClause,
    public readonly parent: $TryStatement,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.CatchClause`,
  ) {
    ctx |= Context.InCatchClause;

    if (node.variableDeclaration === void 0) {
      this.$variableDeclaration = void 0;
    } else {
      this.$variableDeclaration = new $VariableDeclaration(node.variableDeclaration, this, ctx, -1);
    }
    const $block = this.$block = new $Block(node.block, this, ctx, -1);

    this.VarDeclaredNames = $block.VarDeclaredNames;
    this.VarScopedDeclarations = $block.VarScopedDeclarations;
  }
  public CreateBinding(ctx: ExecutionContext, realm: Realm) {
    ctx.checkTimeout();

    for (const argName of this.$variableDeclaration?.BoundNames ?? []) {
      ctx.LexicalEnvironment.CreateMutableBinding(ctx, argName, realm['[[Intrinsics]]'].false);
    }
  }
}

// #endregion
