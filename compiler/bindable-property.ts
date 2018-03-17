import * as ts from 'typescript';
import { IBindable } from "./interfaces";
import { hyphenate } from "./util";

export interface IBindableConfig extends Partial<IBindable> {
  name: string;
}

export class BindableProperty implements IBindable {

  name: string;
  type: string;
  attribute: string;
  defaultValue?: ts.Expression;
  primaryProperty?: boolean;

  constructor(
    config: IBindableConfig
  ) {
    this.name = config.name;
    this.type = config.type || 'string';
    this.attribute = config.attribute || hyphenate(config.name);
    this.defaultValue = config.defaultValue;
    this.primaryProperty = config.primaryProperty;
  }

  get code(): ts.Expression {
    throw new Error('Not implemented');
  }
}
