import {
  DependencyInjectionCodeGenerator,
  ClassActivatorBuilder,
  ActivatorRegistratorBuilder,
  DependencyActivatorInvocationBuilder,
  ModuleImportBuilder,
  ClassActivatorRequest,
  DependencyActivatorInvocationRequest,
  ActivatorRegistratorRequest,
  ModuleImportRequest
} from '../../../ioc/analysis/code-generator';
import * as ts from 'typescript';
import { raw } from '../../fixture/raw';
import * as AST from '../../../ioc/analysis/ast';
import { StaticModuleConfiguration } from '../../../ioc/static-module-configuration';
import { TypeScriptSyntaxTransformer } from '../../../ioc/analysis/syntax-transformer';
import { InjectorBuilder } from '../../../ioc/injector';
import { Node } from '../../../ioc/graph';
import { IObjectContext } from '../../../ioc/composition/interfaces';

describe('DependencyInjectionCodeGenerator', () => {
  let sut: DependencyInjectionCodeGenerator;
  let config: StaticModuleConfiguration;

  beforeEach(() => {
    sut = new DependencyInjectionCodeGenerator();
  });

  beforeAll(() => {
    let sourceFiles = [];
    for (const path in raw) {
      const sourceFile = ts.createSourceFile(path, raw[path], ts.ScriptTarget.ES2015);
      sourceFiles.push(sourceFile);
    }
    let transformer = new TypeScriptSyntaxTransformer();
    config = transformer.create(...sourceFiles);
    config.rootDir = '';
  });

  it('should return correct configuration', () => {
    const actual = sut.create(config);

    expect(actual.fileMap.size).toBe(26); // 26 exported classes in the fixture
  });
});

describe('ClassActivatorBuilder', () => {
  it('should create the correct syntax when there are no dependencies', () => {
    const sut = new ClassActivatorBuilder();
    const request = new ClassActivatorRequest({} as any, { dependencies: [] } as any, { kind: AST.NodeKind.Class, name: 'Foo' } as any);
    const context = { resolve: () => '' } as any;
    const syntax = sut.create(request, context);

    const expected = `class $FooActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new Foo();
        }
        return this.instance;
    }
}
`;

    const actual = printNode([syntax as ts.ClassDeclaration]);
    expect(actual).toEqual(expected);
  });

  it('should create the correct syntax when there is one dependency', () => {
    const sut = new ClassActivatorBuilder();
    const request = new ClassActivatorRequest({} as any, { dependencies: [{}] } as any, { kind: AST.NodeKind.Class, name: 'Foo' } as any);
    const context = { resolve: () => ts.createIdentifier('dep') } as any;
    const syntax = sut.create(request, context);

    const expected = `class $FooActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new Foo(dep);
        }
        return this.instance;
    }
}
`;

    const actual = printNode([syntax as ts.ClassDeclaration]);
    expect(actual).toEqual(expected);
  });

  it('should create the correct syntax when there are multiple dependencies', () => {
    const sut = new ClassActivatorBuilder();
    const request = new ClassActivatorRequest({} as any, { dependencies: [{}, {}, {}] } as any, { kind: AST.NodeKind.Class, name: 'Foo' } as any);
    const context = { resolve: () => ts.createIdentifier('dep') } as any;
    const syntax = sut.create(request, context);

    const expected = `class $FooActivator {
    instance;
    activate() {
        if (this.instance === undefined) {
            this.instance = new Foo(dep, dep, dep);
        }
        return this.instance;
    }
}
`;

    const actual = printNode([syntax as ts.ClassDeclaration]);
    expect(actual).toEqual(expected);
  });
});

describe('ClassDependencyActivatorBuilder', () => {
  it('should create the correct syntax', () => {
    const sut = new DependencyActivatorInvocationBuilder();
    const request = new DependencyActivatorInvocationRequest({} as any, {} as any, { kind: AST.NodeKind.Class, name: 'Foo' } as any);
    const context = {} as any;
    const syntax = sut.create(request, context);

    const expected = `DefaultInjector.INSTANCE.getInstance(Foo);
`;

    const actual = printNode([ts.createStatement(syntax as ts.CallExpression)]);
    expect(actual).toEqual(expected);
  });
});

describe('DependencyActivatorRegistrator', () => {
  it('should create the correct syntax', () => {
    const sut = new ActivatorRegistratorBuilder();
    const request = new ActivatorRegistratorRequest({} as any, {} as any, { kind: AST.NodeKind.Class, name: 'Foo' } as any);
    const context = {} as any;
    const syntax = sut.create(request, context);

    const expected = `DefaultInjector.addActivator(Foo, new $FooActivator());
`;

    const actual = printNode([ts.createStatement(syntax as ts.CallExpression)]);
    expect(actual).toEqual(expected);
  });
});

describe('ModuleImportsBuilder', () => {
  it('should create the correct syntax when a Class is provided', () => {
    const sut = new ModuleImportBuilder();
    const request = new ModuleImportRequest({} as any, {} as any, { kind: AST.NodeKind.Class, name: 'Foo', parent: { path: 'foo/path' } } as any);
    const context = {} as any;
    const syntax = sut.create(request, context)[0];

    const expected = `import { Foo } from "foo/path";
`;

    const actual = printNode([sut.create(request, context) as any]);
    expect(actual).toEqual(expected);
  });

  it('should create the correct syntax when a ModuleImport is provided', () => {
    const sut = new ModuleImportBuilder();
    const request = new ModuleImportRequest({} as any, {} as any, { kind: AST.NodeKind.ModuleImport, name: 'Foo', path: 'foo/path' } as any);
    const context = {} as any;
    const syntax = sut.create(request, context)[0];

    const expected = `import { Foo } from "foo/path";
`;

    const actual = printNode([sut.create(request, context) as any]);
    expect(actual).toEqual(expected);
  });

  it('should create the correct syntax when a ModuleExport is provided', () => {
    const sut = new ModuleImportBuilder();
    const request = new ModuleImportRequest({} as any, {} as any, { kind: AST.NodeKind.ModuleExport, name: 'Foo', path: 'foo/path' } as any);
    const context = {} as any;
    const syntax = sut.create(request, context)[0];

    const expected = `import { Foo } from "foo/path";
`;

    const actual = printNode([sut.create(request, context) as any]);
    expect(actual).toEqual(expected);
  });
});

function printNode(statements: ts.Statement[]): string {
  return ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printFile(ts.updateSourceFileNode(ts.createSourceFile('', '', ts.ScriptTarget.Latest), statements));
}
