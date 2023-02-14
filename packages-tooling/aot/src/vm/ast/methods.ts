import {
  canHaveModifiers,
  GetAccessorDeclaration,
  getModifiers,
  MethodDeclaration,
  ModifierFlags,
  SetAccessorDeclaration,
  SyntaxKind,
} from 'typescript';
import {
  ILogger,
} from '@aurelia/kernel';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $DefinePropertyOrThrow,
} from '../operations';
import {
  $String,
} from '../types/string';
import {
  $Function,
} from '../types/function';
import {
  $Object,
} from '../types/object';
import {
  $Boolean,
} from '../types/boolean';
import {
  $Empty,
} from '../types/empty';
import {
  $Error,
} from '../types/error';
import {
  $PropertyDescriptor,
} from '../types/property-descriptor';
import {
  I$Node,
  Context,
  modifiersToModifierFlags,
  hasBit,
  $$PropertyName,
  $$propertyName,
  $decoratorList,
  $$ESDeclaration,
  $i,
  $$ESVarDeclaration,
  FunctionKind,
} from './_shared';
import {
  $$ESModuleOrScript,
} from './modules';
import {
  $Decorator,
  $ObjectLiteralExpression,
} from './expressions';
import {
  $ClassDeclaration,
  $ClassExpression,
} from './classes';
import {
  MethodDefinitionRecord,
  $FormalParameterList,
  $FunctionDeclaration
} from './functions';
import {
  $Block,
} from './statements';
import {
  $FunctionEnvRec,
} from '../types/environment-record';
import {
  $Any,
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $List,
} from '../types/list';

export class $MethodDeclaration implements I$Node {
  public get $kind(): SyntaxKind.MethodDeclaration { return SyntaxKind.MethodDeclaration; }

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: $FormalParameterList;
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  // 14.6.9 Static Semantics: IsStatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  // 14.3.5 Static Semantics: PropName
  public readonly PropName: $String | $Empty;

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallydeclarednames
  // 14.1.14 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallyscopeddeclarations
  // 14.1.15 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-vardeclarednames
  // 14.1.16 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-varscopeddeclarations
  // 14.1.17 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly functionKind: FunctionKind;

  public constructor(
    public readonly node: MethodDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.MethodDeclaration`,
  ) {
    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(canHaveModifiers(node) ? getModifiers(node) : undefined);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName, -1);
    this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
    const $body = this.$body = new $Block(node.body!, this, ctx, -1);

    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);

    this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
    this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
    this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
    this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;

    if (!hasBit(modifierFlags, ModifierFlags.Async)) {
      if (node.asteriskToken === void 0) {
        this.functionKind = FunctionKind.normal;
      } else {
        this.functionKind = FunctionKind.generator;
      }
    } else if (node.asteriskToken === void 0) {
      this.functionKind = FunctionKind.async;
    } else {
      this.functionKind = FunctionKind.asyncGenerator;
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-definemethod
  // 14.3.7 Runtime Semantics: DefineMethod
  public DefineMethod(
    ctx: ExecutionContext,
    object: $Object,
  ): MethodDefinitionRecord | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // NOTE: this logic and signature is adapted to the fact that this is never a constructor method (that's what $ConstructorDeclaration is for)

    // MethodDefinition : PropertyName ( UniqueFormalParameters ) { FunctionBody }

    // 1. Let propKey be the result of evaluating PropertyName.
    const propKey = this.$name.EvaluatePropName(ctx);

    // 2. ReturnIfAbrupt(propKey).
    if (propKey.isAbrupt) { return propKey.enrichWith(ctx, this); }

    // 3. If the function code for this MethodDefinition is strict mode code, let strict be true. Otherwise let strict be false.
    const strict = intrinsics.true; // TODO: use static semantics

    // 4. Let scope be the running execution context's LexicalEnvironment.
    const scope = ctx.LexicalEnvironment;

    // 5. If functionPrototype is present as a parameter, then
      // 5. a. Let kind be Normal.
      // 5. b. Let prototype be functionPrototype.
    // 6. Else,
      // 6. a. Let kind be Method.
      // 6. b. Let prototype be the intrinsic object %FunctionPrototype%.

    const functionPrototype = intrinsics['%FunctionPrototype%'];

    // 7. Let closure be FunctionCreate(kind, UniqueFormalParameters, FunctionBody, scope, strict, prototype).
    const closure = $Function.FunctionCreate(ctx, 'method', this, scope, strict, functionPrototype);

    // 8. Perform MakeMethod(closure, object).
    closure['[[HomeObject]]'] = object;

    // 9. Set closure.[[SourceText]] to the source text matched by MethodDefinition.
    closure['[[SourceText]]'] = new $String(realm, this.node.getText(this.mos.node));

    // 10. Return the Record { [[Key]]: propKey, [[Closure]]: closure }.
    return new MethodDefinitionRecord(propKey, closure);
  }

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-runtime-semantics-propertydefinitionevaluation
  // 14.3.8 Runtime Semantics: PropertyDefinitionEvaluation
  public EvaluatePropertyDefinition(
    ctx: ExecutionContext,
    object: $Object,
    enumerable: $Boolean,
  ): $Boolean | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // MethodDefinition : PropertyName ( UniqueFormalParameters ) { FunctionBody }

    // 1. Let methodDef be DefineMethod of MethodDefinition with argument object.
    const methodDef = this.DefineMethod(ctx, object);

    // 2. ReturnIfAbrupt(methodDef).
    if (methodDef.isAbrupt) { return methodDef.enrichWith(ctx, this); }

    // 3. Perform SetFunctionName(methodDef.[[Closure]], methodDef.[[Key]]).
    methodDef['[[Closure]]'].SetFunctionName(ctx, methodDef['[[Key]]']);

    // 4. Let desc be the PropertyDescriptor { [[Value]]: methodDef.[[Closure]], [[Writable]]: true, [[Enumerable]]: enumerable, [[Configurable]]: true }.
    const desc = new $PropertyDescriptor(
      realm,
      methodDef['[[Key]]'],
      {
        '[[Value]]': methodDef['[[Closure]]'],
        '[[Writable]]': intrinsics.true,
        '[[Enumerable]]': enumerable,
        '[[Configurable]]': intrinsics.true,
      },
    );

    // 5. Return ? DefinePropertyOrThrow(object, methodDef.[[Key]], desc).
    return $DefinePropertyOrThrow(ctx, object, methodDef['[[Key]]'], desc).enrichWith(ctx, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
  // 14.1.18 Runtime Semantics: EvaluateBody
  public EvaluateBody(
    ctx: ExecutionContext<$FunctionEnvRec, $FunctionEnvRec>,
    functionObject: $Function,
    argumentsList: $List<$AnyNonEmpty>,
  ): $Any {
    ctx.checkTimeout();

    return $FunctionDeclaration.prototype.EvaluateBody.call(this, ctx, functionObject, argumentsList);
  }
}

export class $GetAccessorDeclaration implements I$Node {
  public get $kind(): SyntaxKind.GetAccessor { return SyntaxKind.GetAccessor; }

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: $FormalParameterList;
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  // 14.6.9 Static Semantics: IsStatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  // 14.3.5 Static Semantics: PropName
  public readonly PropName: $String | $Empty;

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallydeclarednames
  // 14.1.14 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallyscopeddeclarations
  // 14.1.15 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-vardeclarednames
  // 14.1.16 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-varscopeddeclarations
  // 14.1.17 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly functionKind: FunctionKind.normal = FunctionKind.normal;

  public constructor(
    public readonly node: GetAccessorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.GetAccessorDeclaration`,
  ) {
    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(canHaveModifiers(node) ? getModifiers(node) : undefined);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName, -1);
    this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
    const $body = this.$body = new $Block(node.body!, this, ctx, -1);

    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);

    this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
    this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
    this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
    this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
  }

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-runtime-semantics-propertydefinitionevaluation
  // 14.3.8 Runtime Semantics: PropertyDefinitionEvaluation
  public EvaluatePropertyDefinition(
    ctx: ExecutionContext,
    object: $Object,
    enumerable: $Boolean,
  ): $Boolean | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // MethodDefinition : get PropertyName ( ) { FunctionBody }

    // 1. Let propKey be the result of evaluating PropertyName.
    const propKey = this.$name.EvaluatePropName(ctx);

    // 2. ReturnIfAbrupt(propKey).
    if (propKey.isAbrupt) { return propKey.enrichWith(ctx, this); }

    // 3. If the function code for this MethodDefinition is strict mode code, let strict be true. Otherwise let strict be false.
    const strict = intrinsics.true; // TODO: use static semantics

    // 4. Let scope be the running execution context's LexicalEnvironment.
    const scope = ctx.LexicalEnvironment;

    // 5. Let formalParameterList be an instance of the production FormalParameters:[empty] .
    // 6. Let closure be FunctionCreate(Method, formalParameterList, FunctionBody, scope, strict).
    const closure = $Function.FunctionCreate(ctx, 'method', this, scope, strict);

    // 7. Perform MakeMethod(closure, object).
    closure['[[HomeObject]]'] = object;

    // 8. Perform SetFunctionName(closure, propKey, "get").
    closure.SetFunctionName(ctx, propKey, intrinsics.$get);

    // 9. Set closure.[[SourceText]] to the source text matched by MethodDefinition.
    closure['[[SourceText]]'] = new $String(realm, this.node.getText(this.mos.node));

    // 10. Let desc be the PropertyDescriptor { [[Get]]: closure, [[Enumerable]]: enumerable, [[Configurable]]: true }.
    const desc = new $PropertyDescriptor(
      realm,
      propKey,
      {
        '[[Get]]': closure,
        '[[Enumerable]]': enumerable,
        '[[Configurable]]': intrinsics.true,
      },
    );

    // 11. Return ? DefinePropertyOrThrow(object, propKey, desc).
    return $DefinePropertyOrThrow(ctx, object, propKey, desc).enrichWith(ctx, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
  // 14.1.18 Runtime Semantics: EvaluateBody
  public EvaluateBody(
    ctx: ExecutionContext<$FunctionEnvRec, $FunctionEnvRec>,
    functionObject: $Function,
    argumentsList: $List<$AnyNonEmpty>,
  ): $Any {
    ctx.checkTimeout();

    return $FunctionDeclaration.prototype.EvaluateBody.call(this, ctx, functionObject, argumentsList);
  }
}

export class $SetAccessorDeclaration implements I$Node {
  public get $kind(): SyntaxKind.SetAccessor { return SyntaxKind.SetAccessor; }

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: $FormalParameterList;
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  // 14.6.9 Static Semantics: IsStatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  // 14.3.5 Static Semantics: PropName
  public readonly PropName: $String | $Empty;

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallydeclarednames
  // 14.1.14 Static Semantics: LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallyscopeddeclarations
  // 14.1.15 Static Semantics: LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-vardeclarednames
  // 14.1.16 Static Semantics: VarDeclaredNames
  public readonly VarDeclaredNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-varscopeddeclarations
  // 14.1.17 Static Semantics: VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];

  public readonly functionKind: FunctionKind.normal = FunctionKind.normal;

  public constructor(
    public readonly node: SetAccessorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.SetAccessorDeclaration`,
  ) {
    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(canHaveModifiers(node) ? getModifiers(node) : undefined);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName, -1);
    this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
    const $body = this.$body = new $Block(node.body!, this, ctx, -1);

    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);

    this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
    this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
    this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
    this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
  }

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-runtime-semantics-propertydefinitionevaluation
  // 14.3.8 Runtime Semantics: PropertyDefinitionEvaluation
  public EvaluatePropertyDefinition(
    ctx: ExecutionContext,
    object: $Object,
    enumerable: $Boolean,
  ): $Boolean | $Error {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // MethodDefinition : set PropertyName ( PropertySetParameterList ) { FunctionBody }

    // 1. Let propKey be the result of evaluating PropertyName.
    const propKey = this.$name.EvaluatePropName(ctx);

    // 2. ReturnIfAbrupt(propKey).
    if (propKey.isAbrupt) { return propKey.enrichWith(ctx, this); }

    // 3. If the function code for this MethodDefinition is strict mode code, let strict be true. Otherwise let strict be false.
    const strict = intrinsics.true; // TODO: use static semantics

    // 4. Let scope be the running execution context's LexicalEnvironment.
    const scope = ctx.LexicalEnvironment;

    // 5. Let closure be FunctionCreate(Method, PropertySetParameterList, FunctionBody, scope, strict).
    const closure = $Function.FunctionCreate(ctx, 'method', this, scope, strict);

    // 6. Perform MakeMethod(closure, object).
    closure['[[HomeObject]]'] = object;

    // 7. Perform SetFunctionName(closure, propKey, "set").
    closure.SetFunctionName(ctx, propKey, intrinsics.$set);

    // 8. Set closure.[[SourceText]] to the source text matched by MethodDefinition.
    closure['[[SourceText]]'] = new $String(realm, this.node.getText(this.mos.node));

    // 9. Let desc be the PropertyDescriptor { [[Set]]: closure, [[Enumerable]]: enumerable, [[Configurable]]: true }.
    const desc = new $PropertyDescriptor(
      realm,
      propKey,
      {
        '[[Set]]': closure,
        '[[Enumerable]]': enumerable,
        '[[Configurable]]': intrinsics.true,
      },
    );

    // 10. Return ? DefinePropertyOrThrow(object, propKey, desc).
    return $DefinePropertyOrThrow(ctx, object, propKey, desc).enrichWith(ctx, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
  // 14.1.18 Runtime Semantics: EvaluateBody
  public EvaluateBody(
    ctx: ExecutionContext<$FunctionEnvRec, $FunctionEnvRec>,
    functionObject: $Function,
    argumentsList: $List<$AnyNonEmpty>,
  ): $Any {
    ctx.checkTimeout();

    return $FunctionDeclaration.prototype.EvaluateBody.call(this, ctx, functionObject, argumentsList);
  }
}
