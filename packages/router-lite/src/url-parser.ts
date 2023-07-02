import { emptyQuery } from './router';

export class ParsedUrl {

  private readonly id: string;

  public constructor(
    public readonly path: string,
    public readonly query: Readonly<URLSearchParams>,
    public readonly fragment: string | null,
  ) {
    Object.freeze(query);
    this.id = `${path}?${query?.toString() ?? ''}#${fragment ?? ''}`;
  }

  public toString(): string {
    return this.id;
  }
}

export interface IUrlParser {
  parse(value: string): ParsedUrl;
  stringify(value: ParsedUrl): string;
  stringify(path: string, query: Readonly<URLSearchParams>, fragment: string | null): string;
}

/**
 * Extracts the route from path.
 */
export class PathUrlParser implements IUrlParser {
  public static readonly instance = new PathUrlParser();
  private constructor() { }
  public parse(value: string): ParsedUrl {
    /**
     * Look for the fragment first and strip it away.
     * Next, look for the query string and strip it away.
     * The remaining value is the path.
     */
    let fragment: string | null = null;
    const fragmentStart = value.indexOf('#');
    if (fragmentStart >= 0) {
      const rawFragment = value.slice(fragmentStart + 1);
      fragment = decodeURIComponent(rawFragment);
      value = value.slice(0, fragmentStart);
    }

    let queryParams: URLSearchParams | null = null;
    const queryStart = value.indexOf('?');
    if (queryStart >= 0) {
      const queryString = value.slice(queryStart + 1);
      value = value.slice(0, queryStart);
      queryParams = new URLSearchParams(queryString);
    }
    return new ParsedUrl(
      value,
      queryParams != null ? queryParams : emptyQuery,
      fragment,
    );
  }

  public stringify(value: ParsedUrl): string;
  public stringify(path: string, query: Readonly<URLSearchParams>, fragment: string | null): string;
  public stringify(pathOrParsedUrl: ParsedUrl | string, query?: Readonly<URLSearchParams>, fragment?: string | null): string {
    // normalize the input
    let path: string;
    if (typeof pathOrParsedUrl === 'string') {
      path = pathOrParsedUrl;
    } else {
      path = pathOrParsedUrl.path;
      query = pathOrParsedUrl.query;
      fragment = pathOrParsedUrl.fragment;
    }
    query ??= emptyQuery;

    // compose the path, query and fragment to compose the serialized URL
    let queryString = query.toString();
    queryString = queryString === '' ? '' : `?${queryString}`;
    const hash = fragment != null && fragment.length > 0 ? `#${encodeURIComponent(fragment)}` : '';

    return `${path}${queryString}${hash}`;
  }
}

/**
 * Extracts the route from fragment.
 */
export class FragmentUrlParser implements IUrlParser {
  public static readonly instance = new FragmentUrlParser();
  private constructor() { }
  public parse(value: string): ParsedUrl {
    /**
     * Look for the fragment; if found then take it and discard the rest.
     * Otherwise, the entire value is the fragment.
     * Next, look for the query string and strip it away.
     * Construct the serialized URL, with the fragment as path, the query and null fragment.
     */
    const fragmentStart = value.indexOf('#');
    if (fragmentStart >= 0) {
      const rawFragment = value.slice(fragmentStart + 1);
      value = decodeURIComponent(rawFragment);
    }

    let queryParams: URLSearchParams | null = null;
    const queryStart = value.indexOf('?');
    if (queryStart >= 0) {
      const queryString = value.slice(queryStart + 1);
      value = value.slice(0, queryStart);
      queryParams = new URLSearchParams(queryString);
    }
    return new ParsedUrl(
      value,
      queryParams != null ? queryParams : emptyQuery,
      null,
    );
  }

  public stringify(value: ParsedUrl): string;
  public stringify(path: string, query: Readonly<URLSearchParams>, fragment: string | null): string;
  public stringify(pathOrParsedUrl: ParsedUrl | string, query?: Readonly<URLSearchParams>, _fragment?: string | null): string {
    // normalize the input
    let path: string;
    if (typeof pathOrParsedUrl === 'string') {
      path = pathOrParsedUrl;
    } else {
      path = pathOrParsedUrl.path;
      query = pathOrParsedUrl.query;
    }
    query ??= emptyQuery;

    // compose the path, query and fragment to compose the serialized URL; ignore the fragment
    let queryString = query.toString();
    queryString = queryString === '' ? '' : `?${queryString}`;

    return `/#/${path}${queryString}`;
  }
}
