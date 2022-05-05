/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { IRouter, IRouterConfiguration } from '../index';
import { RouteableComponentType } from '../interfaces';
import { Separators } from '../router-options';
import { IContainer } from '@aurelia/kernel';

/**
 * @internal - Shouldn't be used directly
 */
export const enum ParametersType {
  none = 'none',
  string = 'string',
  array = 'array',
  object = 'object',
}

export type Parameters = {
  [key: string]: unknown;
};

export interface IComponentParameter {
  key?: string | undefined;
  value: unknown;
}

/**
 * Public API - The routing instructions are the core of the router's navigations
 */

export type ComponentParameters = string | Record<string, unknown> | unknown[];

export class InstructionParameters {
  public parametersString: string | null = null;
  public parametersRecord: Parameters | null = null;
  public parametersList: unknown[] | null = null;
  public parametersType: ParametersType = ParametersType.none;

  public get none(): boolean {
    return this.parametersType === ParametersType.none;
  }

  // Static methods
  public static create(componentParameters?: ComponentParameters): InstructionParameters {
    const parameters: InstructionParameters = new InstructionParameters();
    parameters.set(componentParameters);
    return parameters;
  }

  // TODO: Deal with separators in data and complex types
  public static parse(context: IRouterConfiguration | IRouter | IContainer, parameters: ComponentParameters | null, uriComponent: boolean = false): IComponentParameter[] {
    if (parameters == null || parameters.length === 0) {
      return [];
    }
    const seps = Separators.for(context);
    const parameterSeparator = seps.parameterSeparator;
    const parameterKeySeparator = seps.parameterKeySeparator;

    if (typeof parameters === 'string') {
      const list: IComponentParameter[] = [];
      const params = parameters.split(parameterSeparator);
      for (const param of params) {
        let key: string | undefined;
        let value: string;
        [key, value] = param.split(parameterKeySeparator);
        if (value === void 0) {
          value = uriComponent ? decodeURIComponent(key) : key;
          key = void 0;
        } else if (uriComponent) {
          key = decodeURIComponent(key);
          value = decodeURIComponent(value);
        }
        list.push({ key, value });
      }
      return list;
    }
    if (Array.isArray(parameters)) {
      return parameters.map(param => ({ key: void 0, value: param }));
    }
    const keys = Object.keys(parameters);
    keys.sort();
    return keys.map(key => ({ key, value: parameters[key] }));
  }

  public get typedParameters(): ComponentParameters | null {
    switch (this.parametersType) {
      case ParametersType.string:
        return this.parametersString;
      case ParametersType.array:
        return this.parametersList;
      case ParametersType.object:
        return this.parametersRecord;
      default:
        return null;
    }
  }
  // TODO: Deal with separators in data and complex types
  public static stringify(context: IRouterConfiguration | IRouter | IContainer, parameters: IComponentParameter[], uriComponent: boolean = false): string {
    if (!Array.isArray(parameters) || parameters.length === 0) {
      return '';
    }
    const seps = Separators.for(context);
    return parameters
      .map(param => {
        const key = param.key !== void 0 && uriComponent ? encodeURIComponent(param.key) : param.key;
        const value = uriComponent ? encodeURIComponent(param.value as string) : param.value as string;
        return key !== void 0 && key !== value ? key + seps.parameterKeySeparator + value : value;
      })
      .join(seps.parameterSeparator);
  }

  /**
   * Whether a record of instruction parameters contains another record of
   * instruction parameters.
   *
   * @param parametersToSearch - Parameters that should contain (superset)
   * @param parametersToFind - Parameters that should be contained (subset)
   */
  public static contains(parametersToSearch: Parameters, parametersToFind: Parameters): boolean {
    // All parameters to find need to exist in parameters to search
    return Object.keys(parametersToFind).every(key => parametersToFind[key] === parametersToSearch[key]);
  }

  // Instance methods

  public parameters(context: IRouterConfiguration | IRouter | IContainer): IComponentParameter[] {
    return InstructionParameters.parse(context, this.typedParameters);
  }

  public set(parameters?: ComponentParameters | null): void {
    this.parametersString = null;
    this.parametersList = null;
    this.parametersRecord = null;
    if (parameters == null || parameters === '') {
      this.parametersType = ParametersType.none;
      parameters = null;
    } else if (typeof parameters === 'string') {
      this.parametersType = ParametersType.string;
      this.parametersString = parameters;
    } else if (Array.isArray(parameters)) {
      this.parametersType = ParametersType.array;
      this.parametersList = parameters;
    } else {
      this.parametersType = ParametersType.object;
      this.parametersRecord = parameters;
    }
  }

  public get(context: IRouterConfiguration | IRouter | IContainer, name?: string): IComponentParameter[] | unknown | unknown[] {
    if (name === void 0) {
      // TODO: Turn this into a parameters object instead
      return this.parameters(context);
    }
    const params = this.parameters(context).filter(p => p.key === name).map(p => p.value);
    if (params.length === 0) {
      return;
    }
    return params.length === 1 ? params[0] : params;
  }

  // This only works with objects added to objects!
  public addParameters(parameters: Parameters): void {
    if (this.parametersType === ParametersType.none) {
      return this.set(parameters);
    }
    if (this.parametersType !== ParametersType.object) {
      throw new Error('Can\'t add object parameters to existing non-object parameters!');
    }
    this.set({ ...this.parametersRecord, ...parameters });
  }

  public toSpecifiedParameters(context: IRouterConfiguration | IRouter | IContainer, specifications: string[] | null | undefined): Record<string, unknown> {
    specifications = specifications ?? [];
    const parameters = this.parameters(context);

    const specified: Record<string, unknown> = {};
    for (const spec of specifications) {
      // First get named if it exists
      let index = parameters.findIndex(param => param.key === spec);
      if (index >= 0) {
        const [parameter] = parameters.splice(index, 1);
        specified[spec] = parameter.value;
      } else {
        // Otherwise get first unnamed
        index = parameters.findIndex(param => param.key === void 0);
        if (index >= 0) {
          const [parameter] = parameters.splice(index, 1);
          specified[spec] = parameter.value;
        }
      }
    }
    // Add all remaining named
    for (const parameter of parameters.filter(param => param.key !== void 0)) {
      specified[parameter.key!] = parameter.value;
    }
    let index = specifications.length;
    // Add all remaining unnamed...
    for (const parameter of parameters.filter(param => param.key === void 0)) {
      // ..with an index
      specified[index++] = parameter.value;
    }
    return specified;
  }

  public toSortedParameters(context: IRouterConfiguration | IRouter | IContainer, specifications?: string[] | null | undefined): IComponentParameter[] {
    specifications = specifications || [];
    const parameters = this.parameters(context);

    const sorted: IComponentParameter[] = [];
    for (const spec of specifications) {
      // First get named if it exists
      let index = parameters.findIndex(param => param.key === spec);
      if (index >= 0) {
        const parameter = { ...parameters.splice(index, 1)[0] };
        parameter.key = void 0;
        sorted.push(parameter);
      } else {
        // Otherwise get first unnamed
        index = parameters.findIndex(param => param.key === void 0);
        if (index >= 0) {
          const parameter = { ...parameters.splice(index, 1)[0] };
          sorted.push(parameter);
        } else {
          // Or an empty
          sorted.push({ value: void 0 });
        }
      }
    }
    // Add all remaining named
    const params = parameters.filter(param => param.key !== void 0);
    params.sort((a, b) => (a.key || '') < (b.key || '') ? 1 : (b.key || '') < (a.key || '') ? -1 : 0);
    sorted.push(...params);
    // Add all remaining unnamed...
    sorted.push(...parameters.filter(param => param.key === void 0));

    return sorted;
  }

  // TODO: Somewhere we need to check for format such as spaces etc
  public same(context: IRouterConfiguration | IRouter | IContainer, other: InstructionParameters, componentType: RouteableComponentType | null): boolean {
    const typeParameters = componentType !== null ? componentType.parameters : [];
    const mine = this.toSpecifiedParameters(context, typeParameters);
    const others = other.toSpecifiedParameters(context, typeParameters);

    return Object.keys(mine).every(key => mine[key] === others[key])
      && Object.keys(others).every(key => others[key] === mine[key]);
  }
}
