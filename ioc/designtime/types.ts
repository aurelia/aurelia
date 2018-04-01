import * as AST from './ast';

export function getTypeSourceFromCtorParameter(param: AST.IParameter): AST.INode | null {
  if (param.parent.kind !== AST.NodeKind.Constructor) {
    throw new Error('Expecting constructor parameter');
  }
  // no typename specified on the parameter, try to get it from decorators/inject method
  if (!param.typeName || param.typeName.length === 0) {
    param.typeName = getTypeNameFromInjectProperty(param) || getTypeSourceFromInjectDecorator(param);
    if (param.typeName === null) {
      return null;
    }
  }
  const $module = param.parent.parent.parent;
  let moduleImport = $module.items.find(
    i => i.kind === AST.NodeKind.ModuleImport && (i.alias === param.typeName || (i.name === param.typeName && !i.alias))
  ) as AST.IModuleImport;

  // a typename is specified but no matching import, so must be something declared inside the same module
  if (moduleImport === undefined) {
    const $class = $module.items.find(i => i.kind === AST.NodeKind.Class && i.name === param.typeName);
    if ($class === undefined) {
      throw new Error(`Could not find a matching import or type declaration for ${param.typeName}`);
    }
    return $class;
  }

  // it's not declared inside this module, so calculate the import's absolute path and see if it exists inside the project
  const absolutePath = $module.path;
  const relativePath = moduleImport.path;
  const absoluteParts = absolutePath.split('/');
  const relativeParts = relativePath.split('/');
  for (let i = 0; i < relativeParts.length; i++) {
    if (relativeParts[i] === '.') {
      continue;
    } else if (relativeParts[i] === '..') {
      absoluteParts.pop();
    } else {
      absoluteParts.push(relativeParts[i]);
    }
  }
  const importPath = absoluteParts.join('/');
  const importedModule = $module.parent.modules.find(m => m.path === importPath);
  if (!importedModule) {
    // we're not going to analyze an external module, so just return the import itself and let runtime DI handle the dependency resolution
    return moduleImport;
  }

  // look for an actual export declaration first
  let moduleExport = importedModule.items.find(
    i => i.kind === AST.NodeKind.ModuleExport && (i.alias === param.typeName || (i.name === param.typeName && !i.alias))
  );
  if (!moduleExport) {
    // only if no export declaration is found, look for a matching class or function declared in the module
    moduleExport = importedModule.items.find(
      i => i.kind === (AST.NodeKind.Class || i.kind === AST.NodeKind.Function) && i.name === param.typeName
    );

    // not sure if this is even possible?
    if (!moduleExport) {
      throw new Error(`Module at ${importedModule.path} was expected to have an export of ${param.typeName}`);
    }
  }

  return moduleExport;
}

function getTypeNameFromInjectProperty(param: AST.IParameter): string | null {
  const $class = param.parent.parent as AST.IClass;
  const injectProperty = $class.members.find(m => m.name === 'inject');
  if (!injectProperty) {
    return null;
  }
  // if inject is a function, this will be NodeKind.Method
  if (injectProperty.kind !== AST.NodeKind.Property) {
    throw new Error('function body not yet implemented for statically analyzed inject property');
  }

  // if inject has a property getter, the value will not have been resolved by syntax-transformer
  if (!injectProperty.initializerValue) {
    throw new Error('getter not yet supported for statically analyzed inject property');
  }

  if (!Array.isArray(injectProperty.initializerValue)) {
    throw new Error('inject property must be an array');
  }

  return injectProperty.initializerValue[param.parent.parameters.indexOf(param)];
}

function getTypeSourceFromInjectDecorator(param: AST.IParameter): string | null {
  const $class = param.parent.parent as AST.IClass;

  const injectDecorator = $class.decorators.find(m => m.name === 'inject');
  if (!injectDecorator) {
    return null;
  }

  return injectDecorator.arguments[param.parent.parameters.indexOf(param)].text;
}
