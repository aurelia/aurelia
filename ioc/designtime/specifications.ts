import { IRequestSpecification } from './interfaces';
import { AndSpecification, OrSpecification } from './core';

export class PropertySpecification implements IRequestSpecification {
  public readonly propertyKey: PropertyKey;
  public readonly specification: IRequestSpecification;
  constructor(propertyKey: PropertyKey, specification: IRequestSpecification) {
    this.propertyKey = propertyKey;
    this.specification = specification;
  }

  public isSatisfiedBy(request: any): boolean {
    return this.specification.isSatisfiedBy(request[this.propertyKey]);
  }
}

export class TypeNameSpecification implements IRequestSpecification {
  public readonly typeName: RegExp;
  constructor(typeName: RegExp) {
    this.typeName = typeName;
  }

  public isSatisfiedBy(request: any): boolean {
    return this.typeName.test(Object.prototype.toString.call(request));
  }
}

export class IsTypeScriptSyntaxSpecification implements IRequestSpecification {
  public readonly specification: IRequestSpecification;
  constructor() {
    this.specification = new AndSpecification(
      new TypeNameSpecification(/Object/),
      new OrSpecification(
        new PropertySpecification('kind', new TypeNameSpecification(/Number/)),
        new PropertySpecification('flags', new TypeNameSpecification(/Number/))
      )
    );
  }

  public isSatisfiedBy(request: any): boolean {
    return this.specification.isSatisfiedBy(request);
  }
}
