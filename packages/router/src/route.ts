import { IRoute } from './../dist/router.d';
export interface IRouteData {
  path: string;
  data: Object;
}

export class Route {

  constructor(public config: IRoute) { }

  public applyParams(data: any): IRouteData {
    data = Object.assign({}, data);
    let fragment = (Array.isArray(this.config.path) ? this.config.path[0] : this.config.path);
    const fragments = fragment.split('/');
    const consumed = {};
    for (let i = 0, ilen = fragments.length; i < ilen; ++i) {
      const segment = fragments[i];
      // Try to parse a parameter :param?
      let match = segment.match(/^:([^?]+)(\?)?$/);
      if (match) {
        let [, name, optional] = match;
        fragments[i] = data[name];
        consumed[name] = true;
      }
    }
    fragment = fragments.join('/');
    for (const key in consumed) {
      delete data[key];
    }
    const query = this.buildQueryString(data);
    if (query && query.length) {
      fragment += (fragment.indexOf('?') < 0 ? '?' : '&') + query;
    }
    return { path: fragment, data: data };
  }

  /**
   * Generate a query string from an object.
   *
   * @param params Object containing the keys and values to be used.
   * @param traditional Boolean Use the old URI template standard (RFC6570)
   * @returns The generated query string, excluding leading '?'.
   */
  private buildQueryString(params: Object, traditional?: boolean): string {
    let pairs = [];
    const keys = Object.keys(params || {}).sort();
    for (let key of keys) {
      pairs = pairs.concat(this.buildParam(key, params[key], traditional));
    }

    if (pairs.length === 0) {
      return '';
    }

    return pairs.join('&');
  }

  /**
   * Recursively builds part of query string for parameter.
   *
   * @param key Parameter name for query string.
   * @param value Parameter value to deserialize.
   * @param traditional Boolean Use the old URI template standard (RFC6570)
   * @return Array with serialized parameter(s)
   */
  private buildParam(key: string, value: any, traditional?: boolean): string[] {
    const encode = encodeURIComponent;
    const encodeKey = k => encode(k).replace('%24', '$');

    let result = [];
    if (value === null || value === undefined) {
      return result;
    }
    if (Array.isArray(value)) {
      for (let i = 0, l = value.length; i < l; i++) {
        if (traditional) {
          result.push(`${encodeKey(key)}=${encode(value[i])}`);
        } else {
          const arrayKey = key + '[' + (typeof value[i] === 'object' && value[i] !== null ? i : '') + ']';
          result = result.concat(this.buildParam(arrayKey, value[i]));
        }
      }
    } else if (typeof (value) === 'object' && !traditional) {
      for (const propertyName in value) {
        result = result.concat(this.buildParam(key + '[' + propertyName + ']', value[propertyName]));
      }
    } else {
      result.push(`${encodeKey(key)}=${encode(value)}`);
    }
    return result;
  }
}
