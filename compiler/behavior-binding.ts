import * as ts from 'typescript';
import { AbstractBinding, IBinding } from "./binding";
import { IResourceElement, IResourceAttribute } from "./interfaces";

export class CustomElementBinding extends AbstractBinding {

  behavior = true;
  bindings: IBinding[];

  constructor(
    public elementResource: IResourceElement,
    public targetIndex: number,
    public behaviorIndex: number
  ) {
    super();
  }

  get dehydrated(): any[] {
    return [];
  }

  get code(): ts.Expression {
    return ts.createCall(
      ts.createPropertyAccess(
        ts.createNew(
          ts.createIdentifier(this.elementResource.name),
          /* type arguments */ undefined,
          /* arguments */undefined
        ),
        'applyTo'
      ),
      /* typeArguments */ undefined,
      /** arguments */
      [
        ts.createElementAccess(
          ts.createIdentifier(AbstractBinding.targetsAccessor),
          ts.createNumericLiteral(this.targetIndex.toString())
        )
      ]
    );
  }

  get observedProperties(): string[] {
    return [];
  }
}

export class CustomAttributeBinding extends AbstractBinding {

  behavior = true;
  bindings: IBinding[];

  constructor(
    public attrResource: IResourceAttribute,
    public targetIndex: number,
    public behaviorIndex: number,
    public templateController: boolean = false
  ) {
    super();
  }

  get dehydrated(): any[] {
    return [];
  }

  get code(): ts.Expression {
    return ts.createCall(
      ts.createPropertyAccess(
        ts.createNew(
          ts.createIdentifier(this.attrResource.name),
          /* type arguments */ undefined,
          /* arguments */undefined
        ),
        'applyTo'
      ),
      /* typeArguments */ undefined,
      /** arguments */
      [
        ts.createElementAccess(
          ts.createIdentifier(AbstractBinding.targetsAccessor),
          ts.createNumericLiteral(this.targetIndex.toString())
        )
      ]
    );
  }

  get observedProperties(): string[] {
    return [];
  }
}

