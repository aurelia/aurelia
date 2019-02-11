import { valueConverter } from '@aurelia/runtime';
import { IContainer } from '@aurelia/kernel';

interface IFilterParams {
  field?: string
  value: any
}

type Primitive = null | void | string | number | boolean;

@valueConverter('filter')
export class Filter {
  public static readonly register: (container: IContainer) => IContainer;
  
  toView(array: any[], params: Primitive | IFilterParams): any[] {
    if (!Array.isArray(array) || !array.length) {
      return [];
    }
    if (!params) {
      return array;
    }
    let _isPrimitive = isPrimitive(params);
    let filterValue = _isPrimitive ? params : (params as IFilterParams).value;
    let field = _isPrimitive ? null : (params as IFilterParams).field;
    // let field = params.field;
    // let filterValue = params.value;
    filterValue = typeof filterValue === 'string' ? filterValue.toLowerCase() : filterValue;
    if (filterValue === '' || filterValue === null || filterValue === undefined) {
      return array;
    }

    return array.filter(item => {
      if (field === null) {
        return item;
      }
      let value = field ? item[field] : item;
      if (typeof value === 'string') {
        return value.toLowerCase().indexOf(filterValue) !== -1;
      } else {
        return value === filterValue;
      }
    });
  }
}

function isPrimitive(val: any): val is Primitive {
  return val === null || val === void 0 || typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
}
