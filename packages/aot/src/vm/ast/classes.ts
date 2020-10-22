import {
  ClassDeclaration,
  ClassExpression,
  createIdentifier,
  ExpressionWithTypeArguments,
  HeritageClause,
  ModifierFlags,
  NodeArray,
  PropertyDeclaration,
  SemicolonClassElement,
  SyntaxKind,
  createConstructor,
  createParameter,
  createToken,
  createBlock,
  createExpressionStatement,
  createCall,
  createSuper,
  createSpread,
} from 'typescript';
import {
  emptyArray,
  ILogger,
  Writable,
} from '@aurelia/kernel';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $DeclarativeEnvRec,
  $FunctionEnvRec,
} from '../types/environment-record';
import {
  $String,
} from '../types/string';
import {
  $Undefined,
} from '../types/undefined';
import {
  $Function,
} from '../types/function';
import {
  $Any,
  CompletionType,
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $Object,
} from '../types/object';
import {
  $Null,
} from '../types/null';
import {
  $Empty,
  empty,
} from '../types/empty';
import {
  $TypeError,
  $Error,
} from '../types/error';
import {
  $PropertyDescriptor,
} from '../types/property-descriptor';
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
  $$TSDeclaration,
  $$LHSExpressionOrHigher,
  $LHSExpression,
  $LHSExpressionNode,
  $$ClassElement,
  $$MethodDefinition,
  $AnyParentNode,
  $$classElementList,
  $ClassElementNode,
  hasAllBits,
  $decoratorList,
  $i,
  $$ESVarDeclaration,
  FunctionKind,
} from './_shared';
import {
  ExportEntryRecord,
  $$ESModuleOrScript,
} from './modules';
import {
  $Identifier,
  $Decorator,
} from './expressions';
import {
  $InterfaceDeclaration,
} from './types';
import {
  $ConstructorDeclaration,
} from './functions';
import {
  $List,
} from '../types/list';

// #region Declaration members

export type $$NodeWithHeritageClauses = (
  $ClassDeclaration |
  $ClassExpression |
  $InterfaceDeclaration
);

export function $expressionWithTypeArgumentsList(
  nodes: readonly ExpressionWithTypeArguments[],
  parent: $HeritageClause,
  ctx: Context,
): readonly $ExpressionWithTypeArguments[] {
  if (nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $ExpressionWithTypeArguments[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $ExpressionWithTypeArguments(nodes[i], parent, ctx, i);
  }
  return $nodes;
}

export class $HeritageClause implements I$Node {
  public get $kind(): SyntaxKind.HeritageClause { return SyntaxKind.HeritageClause; }

  public readonly $types: readonly $ExpressionWithTypeArguments[];

  public constructor(
    public readonly node: HeritageClause,
    public readonly parent: $$NodeWithHeritageClauses,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.HeritageClause`,
  ) {
    this.$types = $expressionWithTypeArgumentsList(node.types, this, ctx);
  }
}

export class $ExpressionWithTypeArguments implements I$Node {
  public get $kind(): SyntaxKind.ExpressionWithTypeArguments { return SyntaxKind.ExpressionWithTypeArguments; }

  public readonly $expression: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: ExpressionWithTypeArguments,
    public readonly parent: $HeritageClause,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ExpressionWithTypeArguments`,
  ) {
    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx, -1);
  }
}

// #endregion

export class $ClassExpression implements I$Node {
  public get $kind(): SyntaxKind.ClassExpression { return SyntaxKind.ClassExpression; }

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier | undefined;
  public readonly $heritageClauses: readonly $HeritageClause[];
  public readonly $members: readonly $$ClassElement[];

  public readonly ClassHeritage: $HeritageClause | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-boundnames
  // 14.6.2 Static Semantics: BoundNames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-constructormethod
  // 14.6.3 Static Semantics: ConstructorMethod
  public readonly ConstructorMethod: $ConstructorDeclaration | undefined = void 0;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-hasname
  // 14.6.6 Static Semantics: HasName
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isconstantdeclaration
  // 14.6.7 Static Semantics: IsConstantDeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isfunctiondefinition
  // 14.6.8 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-nonconstructormethoddefinitions
  // 14.6.10 Static Semantics: NonConstructorMethodDefinitions
  public readonly NonConstructorMethodDefinitions: $$MethodDefinition[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-prototypepropertynamelist
  // 14.6.11 Static Semantics: PrototypePropertyNameList
  public readonly PrototypePropertyNameList: readonly $String[];

  public constructor(
    public readonly node: ClassExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ClassExpression`,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    const $name = this.$name = $identifier(node.name, this, ctx, -1);
    const $heritageClauses = this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);
    const $members = this.$members = $$classElementList(node.members as NodeArray<$ClassElementNode>, this, ctx);

    this.ClassHeritage = $heritageClauses.find(h => h.node.token === SyntaxKind.ExtendsKeyword);

    if ($name === void 0) {
      this.BoundNames = [intrinsics['*default*']];
    } else {
      if (hasAllBits(modifierFlags, ModifierFlags.ExportDefault)) {
        this.BoundNames = [...$name.BoundNames, intrinsics['*default*']];
      } else {
        this.BoundNames = $name.BoundNames;
      }
    }

    const NonConstructorMethodDefinitions = this.NonConstructorMethodDefinitions = [] as $$MethodDefinition[];
    const PrototypePropertyNameList = this.PrototypePropertyNameList = [] as $String[];

    let $member: $$ClassElement;
    for (let i = 0, ii = $members.length; i < ii; ++i) {
      $member = $members[i];
      switch ($member.$kind) {
        case SyntaxKind.PropertyDeclaration:
          break;
        case SyntaxKind.Constructor:
          this.ConstructorMethod = $member;
          break;
        case SyntaxKind.MethodDeclaration:
        case SyntaxKind.GetAccessor:
        case SyntaxKind.SetAccessor:
          NonConstructorMethodDefinitions.push($member);
          if (!$member.PropName.isEmpty && !$member.IsStatic) {
            PrototypePropertyNameList.push($member.PropName as $String);
          }
          break;
        case SyntaxKind.SemicolonClassElement:
      }
    }

    this.HasName = $name !== void 0;
  }

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-runtime-semantics-namedevaluation
  // 14.6.15 Runtime Semantics: NamedEvaluation
  public EvaluateNamed(
    ctx: ExecutionContext,
    name: $String,
  ): $Function | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // ClassExpression : class ClassTail

    // 1. Return the result of ClassDefinitionEvaluation of ClassTail with arguments undefined and name.
    return $ClassDeclaration.prototype.EvaluateClassDefinition.call(this, ctx, intrinsics.undefined, name);
  }

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-runtime-semantics-evaluation
  // 14.6.16 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Function | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
    // ClassExpression : class BindingIdentifier opt ClassTail

    // 1. If BindingIdentifieropt is not present, let className be undefined.
    // 2. Else, let className be StringValue of BindingIdentifier.
    const className = this.$name === void 0 ? intrinsics.undefined : this.$name.StringValue;

    // 3. Let value be the result of ClassDefinitionEvaluation of ClassTail with arguments className and className.
    const value = $ClassDeclaration.prototype.EvaluateClassDefinition.call(this, ctx, className, className);

    // 4. ReturnIfAbrupt(value).
    if (value.isAbrupt) { return value.enrichWith(ctx, this); }

    // 5. Set value.[[SourceText]] to the source text matched by ClassExpression.
    value['[[SourceText]]'] = new $String(realm, this.node.getText(this.mos.node));

    // 6. Return value.
    return value;
  }
}

export class $ClassDeclaration implements I$Node {
  public get $kind(): SyntaxKind.ClassDeclaration { return SyntaxKind.ClassDeclaration; }

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $Identifier | $Undefined;
  public readonly $heritageClauses: readonly $HeritageClause[];
  public readonly $members: readonly $$ClassElement[];

  public readonly ClassHeritage: $HeritageClause | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-boundnames
  // 14.6.2 Static Semantics: BoundNames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-constructormethod
  // 14.6.3 Static Semantics: ConstructorMethod
  public readonly ConstructorMethod: $ConstructorDeclaration | undefined;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-hasname
  // 14.6.6 Static Semantics: HasName
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isconstantdeclaration
  // 14.6.7 Static Semantics: IsConstantDeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isfunctiondefinition
  // 14.6.8 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-nonconstructormethoddefinitions
  // 14.6.10 Static Semantics: NonConstructorMethodDefinitions
  public readonly NonConstructorMethodDefinitions: readonly $$MethodDefinition[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-prototypepropertynamelist
  // 14.6.11 Static Semantics: PrototypePropertyNameList
  public readonly PrototypePropertyNameList: readonly $String[];
  public readonly VarDeclaredNames: readonly $String[] = emptyArray; // TODO: this is actually not explicitly specced. Need to double check
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-varscopeddeclarations
  // 13.1.6 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[] = emptyArray;

  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportedbindings
  // 15.2.3.3 Static Semantics: ExportedBindings
  public readonly ExportedBindings: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportednames
  // 15.2.3.4 Static Semantics: ExportedNames
  public readonly ExportedNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-exportentries
  // 15.2.3.5 Static Semantics: ExportEntries
  public readonly ExportEntries: readonly ExportEntryRecord[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-lexicallyscopeddeclarations
  // 15.2.3.8 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray; // TODO: this is actually not explicitly specced. Need to double check
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-exports-static-semantics-modulerequests
  // 15.2.3.9 Static Semantics: ModuleRequests
  public readonly ModuleRequests: readonly $String[];

  public readonly TypeDeclarations: readonly $$TSDeclaration[] = emptyArray;
  public readonly IsType: false = false;

  public constructor(
    public readonly node: ClassDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.ClassDeclaration`,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    let $name: $Identifier | $Undefined;
    if (node.name === void 0) {
      $name = this.$name = new $Undefined(realm, void 0, void 0, this);
    } else {
      $name = this.$name = new $Identifier(node.name, this, ctx, -1);
    }
    const $heritageClauses = this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);
    const $members = this.$members = $$classElementList(node.members as NodeArray<$ClassElementNode>, this, ctx);

    this.ClassHeritage = $heritageClauses.find(h => h.node.token === SyntaxKind.ExtendsKeyword);

    const NonConstructorMethodDefinitions = this.NonConstructorMethodDefinitions = [] as $$MethodDefinition[];
    const PrototypePropertyNameList = this.PrototypePropertyNameList = [] as $String[];

    let $member: $$ClassElement;
    for (let i = 0, ii = $members.length; i < ii; ++i) {
      $member = $members[i];
      switch ($member.$kind) {
        case SyntaxKind.PropertyDeclaration:
          break;
        case SyntaxKind.Constructor:
          this.ConstructorMethod = $member;
          break;
        case SyntaxKind.MethodDeclaration:
        case SyntaxKind.GetAccessor:
        case SyntaxKind.SetAccessor:
          NonConstructorMethodDefinitions.push($member);
          if (!$member.PropName.isEmpty && !$member.IsStatic) {
            PrototypePropertyNameList.push($member.PropName as $String);
          }
          break;
        case SyntaxKind.SemicolonClassElement:
      }
    }

    const HasName = this.HasName = !$name.isUndefined;

    if (hasBit(ctx, Context.InExport)) {
      if (hasBit(this.modifierFlags, ModifierFlags.Default)) {
        if (HasName) {
          const [localName] = ($name as $Identifier).BoundNames;
          const BoundNames = this.BoundNames = [localName, intrinsics['*default*']];

          this.ExportedBindings = BoundNames;
          this.ExportedNames = [intrinsics['default']];
          this.ExportEntries = [
            new ExportEntryRecord(
              /* source */this,
              /* ExportName */intrinsics['default'],
              /* ModuleRequest */intrinsics.null,
              /* ImportName */intrinsics.null,
              /* LocalName */localName,
            ),
          ];
        } else {
          const BoundNames = this.BoundNames = [intrinsics['*default*']];

          this.ExportedBindings = BoundNames;
          this.ExportedNames = [intrinsics['default']];
          this.ExportEntries = [
            new ExportEntryRecord(
              /* source */this,
              /* ExportName */intrinsics['default'],
              /* ModuleRequest */intrinsics.null,
              /* ImportName */intrinsics.null,
              /* LocalName */intrinsics['*default*'],
            ),
          ];
        }

        this.LexicallyScopedDeclarations = [this];
      } else {
        // Must have a name, so we assume it does
        const BoundNames = this.BoundNames = ($name as $Identifier).BoundNames;
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

        this.LexicallyScopedDeclarations = [this];
      }
    } else {
      // Must have a name, so we assume it does
      this.BoundNames = ($name as $Identifier).BoundNames;

      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;

      this.LexicallyScopedDeclarations = emptyArray;
    }

    this.ModuleRequests = emptyArray;
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-classdefinitionevaluation
  // 14.6.13 Runtime Semantics: ClassDefinitionEvaluation
  public EvaluateClassDefinition(
    this: $ClassDeclaration | $ClassExpression,
    ctx: ExecutionContext,
    classBinding: $String | $Undefined,
    className: $String | $Undefined,
  ): $Function | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // ClassTail : ClassHeritage opt { ClassBody opt }

    // 1. Let lex be the LexicalEnvironment of the running execution context.
    const lex = ctx.LexicalEnvironment;

    // 2. Let classScope be NewDeclarativeEnvironment(lex).
    const classScope = new $DeclarativeEnvRec(this.logger, realm, lex);

    // 3. Let classScopeEnvRec be classScope's EnvironmentRecord.
    // 4. If classBinding is not undefined, then
    if (!classBinding.isUndefined) {
      // 4. a. Perform classScopeEnvRec.CreateImmutableBinding(classBinding, true).
      classScope.CreateImmutableBinding(ctx, classBinding, intrinsics.true);
    }

    let protoParent: $Object | $Null;
    let constructorParent: $Object;

    // 5. If ClassHeritageopt is not present, then
    if (this.ClassHeritage === void 0) {
      // 5. a. Let protoParent be the intrinsic object %ObjectPrototype%.
      protoParent = intrinsics['%ObjectPrototype%'];

      // 5. b. Let constructorParent be the intrinsic object %FunctionPrototype%.
      constructorParent = intrinsics['%FunctionPrototype%'];
    }
    // 6. Else,
    else {
      // 6. a. Set the running execution context's LexicalEnvironment to classScope.
      ctx.LexicalEnvironment = classScope;

      // 6. b. Let superclassRef be the result of evaluating ClassHeritage.
      const superClassRef = this.ClassHeritage.$types[0].$expression.Evaluate(ctx);

      // 6. c. Set the running execution context's LexicalEnvironment to lex.
      ctx.LexicalEnvironment = lex;

      // 6. d. Let superclass be ? GetValue(superclassRef).
      const superClass = superClassRef.GetValue(ctx);
      if (superClass.isAbrupt) { return superClass.enrichWith(ctx, this); }

      // 6. e. If superclass is null, then
      if (superClass.isNull) {
        // 6. e. i. Let protoParent be null.
        protoParent = intrinsics.null;

        // 6. e. ii. Let constructorParent be the intrinsic object %FunctionPrototype%.
        constructorParent = intrinsics['%FunctionPrototype%'];
      }
      // 6. f. Else if IsConstructor(superclass) is false, throw a TypeError exception.
      else if (!superClass.isFunction) {
        return new $TypeError(realm, `Superclass is ${superClass}, but expected a function`);
      }
      // 6. g. Else,
      else {
        // 6. g. i. Let protoParent be ? Get(superclass, "prototype").
        const $protoParent = superClass['[[Get]]'](ctx, intrinsics.$prototype, superClass);
        if ($protoParent.isAbrupt) { return $protoParent.enrichWith(ctx, this); }

        // 6. g. ii. If Type(protoParent) is neither Object nor Null, throw a TypeError exception.
        if (!$protoParent.isObject && !$protoParent.isNull) {
          return new $TypeError(realm, `Superclass prototype is ${superClass}, but expected null or an object`);
        }

        protoParent = $protoParent;

        // 6. g. iii. Let constructorParent be superclass.
        constructorParent = superClass;
      }
    }

    // 7. Let proto be ObjectCreate(protoParent).
    const proto = new $Object(realm, 'proto', protoParent, CompletionType.normal, intrinsics.empty);

    let constructor: $ConstructorDeclaration | $Empty;

    // 8. If ClassBodyopt is not present, let constructor be empty.
    if (this.ConstructorMethod === void 0) {
      constructor = intrinsics.empty;
    }
    // 9. Else, let constructor be ConstructorMethod of ClassBody.
    else {
      constructor = this.ConstructorMethod;
    }

    // 10. If constructor is empty, then
    if (constructor instanceof $Empty) {
      // 10. a. If ClassHeritageopt is present, then
      if (this.ClassHeritage !== void 0) {
        // 10. a. i. Set constructor to the result of parsing the source text constructor(... args){ super (...args);} using the syntactic grammar with the goal symbol MethodDefinition[~Yield, ~Await].
        constructor = (this as Writable<$ClassDeclaration>).ConstructorMethod = new $ConstructorDeclaration(
          createConstructor(
            void 0,
            void 0,
            [
              createParameter(
                void 0,
                void 0,
                createToken(SyntaxKind.DotDotDotToken),
                createIdentifier('args'),
              ),
            ],
            createBlock(
              [
                createExpressionStatement(
                  createCall(
                    createSuper(),
                    void 0,
                    [
                      createSpread(
                        createIdentifier('args'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          this,
          this.ctx,
          -1,
        );
      }
      // 10. b. Else,
      else {
        // 10. b. i. Set constructor to the result of parsing the source text constructor(){ } using the syntactic grammar with the goal symbol MethodDefinition[~Yield, ~Await].
        constructor = (this as Writable<$ClassDeclaration>).ConstructorMethod = new $ConstructorDeclaration(
          createConstructor(
            void 0,
            void 0,
            [],
            createBlock([]),
          ),
          this,
          this.ctx,
          -1,
        );
      }
    }

    // 11. Set the running execution context's LexicalEnvironment to classScope.
    ctx.LexicalEnvironment = classScope;

    // 12. Let constructorInfo be the result of performing DefineMethod for constructor with arguments proto and constructorParent as the optional functionPrototype argument.
    const constructorInfo = constructor.DefineMethod(ctx, proto, constructorParent);

    // 13. Assert: constructorInfo is not an abrupt completion.
    // 14. Let F be constructorInfo.[[Closure]].
    const F = constructorInfo['[[Closure]]'];

    // 15. If ClassHeritageopt is present, set F.[[ConstructorKind]] to "derived".
    if (this.ClassHeritage !== void 0) {
      F['[[ConstructorKind]]'] = 'derived';
    }

    // 16. Perform MakeConstructor(F, false, proto).
    F.MakeConstructor(ctx, intrinsics.false, proto);

    // 17. Perform MakeClassConstructor(F).
    F['[[FunctionKind]]'] = FunctionKind.classConstructor;

    // 18. If className is not undefined, then
    if (!className.isUndefined) {
      // 18. a. Perform SetFunctionName(F, className).
      F.SetFunctionName(ctx, className);
    }

    // 19. Perform CreateMethodProperty(proto, "constructor", F).
    proto['[[DefineOwnProperty]]'](
      ctx,
      intrinsics.$constructor,
      new $PropertyDescriptor(
        realm,
        intrinsics.$constructor,
        {
          '[[Value]]': F,
          '[[Writable]]': intrinsics.true,
          '[[Enumerable]]': intrinsics.false,
          '[[Configurable]]': intrinsics.true,
        },
      ),
    );

    // 20. If ClassBodyopt is not present, let methods be a new empty List.
    // 21. Else, let methods be NonConstructorMethodDefinitions of ClassBody.
    const methods = this.NonConstructorMethodDefinitions;

    let status: $Any;

    // 22. For each ClassElement m in order from methods, do
    for (const m of methods) {
      // 22. a. If IsStatic of m is false, then
      if (!m.IsStatic) {
        // 22. a. i. Let status be the result of performing PropertyDefinitionEvaluation for m with arguments proto and false.
        status = m.EvaluatePropertyDefinition(ctx, proto, intrinsics.false);
      }
      // 22. b. Else,
      else {
        // 22. b. i. Let status be the result of performing PropertyDefinitionEvaluation for m with arguments F and false.
        status = m.EvaluatePropertyDefinition(ctx, F, intrinsics.false);
      }

      // 22. c. If status is an abrupt completion, then
      if (status.isAbrupt) {
        // 22. c. i. Set the running execution context's LexicalEnvironment to lex.
        ctx.LexicalEnvironment = lex;

        // 22. c. ii. Return Completion(status).
        return status;
      }
    }

    // 23. Set the running execution context's LexicalEnvironment to lex.
    ctx.LexicalEnvironment = lex;

    // 24. If classBinding is not undefined, then
    if (!classBinding.isUndefined) {
      // 24. a. Perform classScopeEnvRec.InitializeBinding(classBinding, F).
      classScope.InitializeBinding(ctx, classBinding, F);
    }

    // 25. Return F.
    return F;
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-bindingclassdeclarationevaluation
  // 14.6.14 Runtime Semantics: BindingClassDeclarationEvaluation
  public EvaluateBindingClassDeclaration(
    ctx: ExecutionContext,
  ): $Function | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    const name = this.$name;
    if (name.isUndefined) {
      // ClassDeclaration : class ClassTail

      // 1. Let value be the result of ClassDefinitionEvaluation of ClassTail with arguments undefined and "default".
      const value = this.EvaluateClassDefinition(ctx, intrinsics.undefined, intrinsics.default);

      // 2. ReturnIfAbrupt(value).
      if (value.isAbrupt) { return value.enrichWith(ctx, this); }

      // 3. Set value.[[SourceText]] to the source text matched by ClassDeclaration.
      value['[[SourceText]]'] = new $String(realm, this.node.getText(this.mos.node));

      // 4. Return value.
      return value;
    }

    // ClassDeclaration : class BindingIdentifier ClassTail

    // 1. Let className be StringValue of BindingIdentifier.
    const className = name.StringValue;

    // 2. Let value be the result of ClassDefinitionEvaluation of ClassTail with arguments className and className.
    const value = this.EvaluateClassDefinition(ctx, className, className);

    // 3. ReturnIfAbrupt(value).
    if (value.isAbrupt) { return value.enrichWith(ctx, this); }

    // 4. Set value.[[SourceText]] to the source text matched by ClassDeclaration.
    value['[[SourceText]]'] = new $String(realm, this.node.getText(this.mos.node));

    // 5. Let env be the running execution context's LexicalEnvironment.
    // 6. Perform ? InitializeBoundName(className, value, env).
    const $InitializeBoundNameResult = ctx.LexicalEnvironment.InitializeBinding(ctx, className, value);
    if ($InitializeBoundNameResult.isAbrupt) { return $InitializeBoundNameResult.enrichWith(ctx, this); }

    // 7. Return value.
    return value;
  }

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-runtime-semantics-evaluation
  // 14.6.16 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Empty | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // ClassDeclaration : class BindingIdentifier ClassTail

    // 1. Perform ? BindingClassDeclarationEvaluation of this ClassDeclaration.
    const $EvaluateBindingClassDeclarationResult = this.EvaluateBindingClassDeclaration(ctx);
    if ($EvaluateBindingClassDeclarationResult.isAbrupt) { return $EvaluateBindingClassDeclarationResult.enrichWith(ctx, this); }

    // 2. Return NormalCompletion(empty).
    return intrinsics.empty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
  // 14.1.18 Runtime Semantics: EvaluateBody
  public EvaluateBody(
    ctx: ExecutionContext<$FunctionEnvRec, $FunctionEnvRec>,
    functionObject: $Function,
    argumentsList: $List<$AnyNonEmpty>,
  ): $Any {
    ctx.checkTimeout();

    return this.ConstructorMethod!.EvaluateBody(ctx, functionObject, argumentsList);
  }
}

export class $PropertyDeclaration implements I$Node {
  public get $kind(): SyntaxKind.PropertyDeclaration { return SyntaxKind.PropertyDeclaration; }

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  // 14.6.9 Static Semantics: IsStatic
  public readonly IsStatic: boolean;

  public constructor(
    public readonly node: PropertyDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.PropertyDeclaration`,
  ) {
    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName, -1);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx, -1);

    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
  }
}

export class $SemicolonClassElement implements I$Node {
  public get $kind(): SyntaxKind.SemicolonClassElement { return SyntaxKind.SemicolonClassElement; }

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  // 14.6.9 Static Semantics: IsStatic
  public readonly IsStatic: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  // 14.3.5 Static Semantics: PropName
  public readonly PropName: empty = empty;

  public constructor(
    public readonly node: SemicolonClassElement,
    public readonly parent: $ClassDeclaration | $ClassExpression,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.SemicolonClassElement`,
  ) {}
}

