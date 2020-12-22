import { ModifierFlags, SyntaxKind, } from 'typescript';
import { $DefinePropertyOrThrow, } from '../operations.js';
import { $String, } from '../types/string.js';
import { $Function, } from '../types/function.js';
import { $PropertyDescriptor, } from '../types/property-descriptor.js';
import { modifiersToModifierFlags, hasBit, $$propertyName, $decoratorList, $i, } from './_shared.js';
import { MethodDefinitionRecord, $FormalParameterList, $FunctionDeclaration } from './functions.js';
import { $Block, } from './statements.js';
export class $MethodDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.MethodDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);
        this.$decorators = $decoratorList(node.decorators, this, ctx);
        const $name = this.$name = $$propertyName(node.name, this, ctx | 512 /* IsMemberName */, -1);
        this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
        const $body = this.$body = new $Block(node.body, this, ctx, -1);
        this.PropName = $name.PropName;
        this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
        this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
        this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
        this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
        this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
        if (!hasBit(modifierFlags, ModifierFlags.Async)) {
            if (node.asteriskToken === void 0) {
                this.functionKind = 0 /* normal */;
            }
            else {
                this.functionKind = 4 /* generator */;
            }
        }
        else if (node.asteriskToken === void 0) {
            this.functionKind = 8 /* async */;
        }
        else {
            this.functionKind = 12 /* asyncGenerator */;
        }
    }
    get $kind() { return SyntaxKind.MethodDeclaration; }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-definemethod
    // 14.3.7 Runtime Semantics: DefineMethod
    DefineMethod(ctx, object) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // NOTE: this logic and signature is adapted to the fact that this is never a constructor method (that's what $ConstructorDeclaration is for)
        // MethodDefinition : PropertyName ( UniqueFormalParameters ) { FunctionBody }
        // 1. Let propKey be the result of evaluating PropertyName.
        const propKey = this.$name.EvaluatePropName(ctx);
        // 2. ReturnIfAbrupt(propKey).
        if (propKey.isAbrupt) {
            return propKey.enrichWith(ctx, this);
        }
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
    EvaluatePropertyDefinition(ctx, object, enumerable) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // MethodDefinition : PropertyName ( UniqueFormalParameters ) { FunctionBody }
        // 1. Let methodDef be DefineMethod of MethodDefinition with argument object.
        const methodDef = this.DefineMethod(ctx, object);
        // 2. ReturnIfAbrupt(methodDef).
        if (methodDef.isAbrupt) {
            return methodDef.enrichWith(ctx, this);
        }
        // 3. Perform SetFunctionName(methodDef.[[Closure]], methodDef.[[Key]]).
        methodDef['[[Closure]]'].SetFunctionName(ctx, methodDef['[[Key]]']);
        // 4. Let desc be the PropertyDescriptor { [[Value]]: methodDef.[[Closure]], [[Writable]]: true, [[Enumerable]]: enumerable, [[Configurable]]: true }.
        const desc = new $PropertyDescriptor(realm, methodDef['[[Key]]'], {
            '[[Value]]': methodDef['[[Closure]]'],
            '[[Writable]]': intrinsics.true,
            '[[Enumerable]]': enumerable,
            '[[Configurable]]': intrinsics.true,
        });
        // 5. Return ? DefinePropertyOrThrow(object, methodDef.[[Key]], desc).
        return $DefinePropertyOrThrow(ctx, object, methodDef['[[Key]]'], desc).enrichWith(ctx, this);
    }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
    // 14.1.18 Runtime Semantics: EvaluateBody
    EvaluateBody(ctx, functionObject, argumentsList) {
        ctx.checkTimeout();
        return $FunctionDeclaration.prototype.EvaluateBody.call(this, ctx, functionObject, argumentsList);
    }
}
export class $GetAccessorDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.GetAccessorDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.functionKind = 0 /* normal */;
        const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);
        this.$decorators = $decoratorList(node.decorators, this, ctx);
        const $name = this.$name = $$propertyName(node.name, this, ctx | 512 /* IsMemberName */, -1);
        this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
        const $body = this.$body = new $Block(node.body, this, ctx, -1);
        this.PropName = $name.PropName;
        this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
        this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
        this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
        this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
        this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
    }
    get $kind() { return SyntaxKind.GetAccessor; }
    // http://www.ecma-international.org/ecma-262/#sec-method-definitions-runtime-semantics-propertydefinitionevaluation
    // 14.3.8 Runtime Semantics: PropertyDefinitionEvaluation
    EvaluatePropertyDefinition(ctx, object, enumerable) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // MethodDefinition : get PropertyName ( ) { FunctionBody }
        // 1. Let propKey be the result of evaluating PropertyName.
        const propKey = this.$name.EvaluatePropName(ctx);
        // 2. ReturnIfAbrupt(propKey).
        if (propKey.isAbrupt) {
            return propKey.enrichWith(ctx, this);
        }
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
        const desc = new $PropertyDescriptor(realm, propKey, {
            '[[Get]]': closure,
            '[[Enumerable]]': enumerable,
            '[[Configurable]]': intrinsics.true,
        });
        // 11. Return ? DefinePropertyOrThrow(object, propKey, desc).
        return $DefinePropertyOrThrow(ctx, object, propKey, desc).enrichWith(ctx, this);
    }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
    // 14.1.18 Runtime Semantics: EvaluateBody
    EvaluateBody(ctx, functionObject, argumentsList) {
        ctx.checkTimeout();
        return $FunctionDeclaration.prototype.EvaluateBody.call(this, ctx, functionObject, argumentsList);
    }
}
export class $SetAccessorDeclaration {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.SetAccessorDeclaration`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.functionKind = 0 /* normal */;
        const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);
        this.$decorators = $decoratorList(node.decorators, this, ctx);
        const $name = this.$name = $$propertyName(node.name, this, ctx | 512 /* IsMemberName */, -1);
        this.$parameters = new $FormalParameterList(node.parameters, this, ctx);
        const $body = this.$body = new $Block(node.body, this, ctx, -1);
        this.PropName = $name.PropName;
        this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
        this.LexicallyDeclaredNames = $body.TopLevelLexicallyDeclaredNames;
        this.LexicallyScopedDeclarations = $body.TopLevelLexicallyScopedDeclarations;
        this.VarDeclaredNames = $body.TopLevelVarDeclaredNames;
        this.VarScopedDeclarations = $body.TopLevelVarScopedDeclarations;
    }
    get $kind() { return SyntaxKind.SetAccessor; }
    // http://www.ecma-international.org/ecma-262/#sec-method-definitions-runtime-semantics-propertydefinitionevaluation
    // 14.3.8 Runtime Semantics: PropertyDefinitionEvaluation
    EvaluatePropertyDefinition(ctx, object, enumerable) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // MethodDefinition : set PropertyName ( PropertySetParameterList ) { FunctionBody }
        // 1. Let propKey be the result of evaluating PropertyName.
        const propKey = this.$name.EvaluatePropName(ctx);
        // 2. ReturnIfAbrupt(propKey).
        if (propKey.isAbrupt) {
            return propKey.enrichWith(ctx, this);
        }
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
        const desc = new $PropertyDescriptor(realm, propKey, {
            '[[Set]]': closure,
            '[[Enumerable]]': enumerable,
            '[[Configurable]]': intrinsics.true,
        });
        // 10. Return ? DefinePropertyOrThrow(object, propKey, desc).
        return $DefinePropertyOrThrow(ctx, object, propKey, desc).enrichWith(ctx, this);
    }
    // http://www.ecma-international.org/ecma-262/#sec-function-definitions-runtime-semantics-evaluatebody
    // 14.1.18 Runtime Semantics: EvaluateBody
    EvaluateBody(ctx, functionObject, argumentsList) {
        ctx.checkTimeout();
        return $FunctionDeclaration.prototype.EvaluateBody.call(this, ctx, functionObject, argumentsList);
    }
}
//# sourceMappingURL=methods.js.map