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

  /** @internal */
  public static _create(value: string) {
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
}

export interface IUrlParser {
  parse(value: string): ParsedUrl;
  stringify(value: ParsedUrl): string;
  stringify(path: string, query: Readonly<URLSearchParams>, fragment: string | null): string;
}

function stringify(value: ParsedUrl): string;
function stringify(path: string, query: Readonly<URLSearchParams>, fragment: string | null): string;
function stringify(pathOrParsedUrl: ParsedUrl | string, query?: Readonly<URLSearchParams>, fragment?: string | null): string {
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

export const pathUrlParser: IUrlParser = Object.freeze({
  parse(value: string): ParsedUrl {
    return ParsedUrl._create(value);
  },
  stringify(pathOrParsedUrl: ParsedUrl | string, query?: Readonly<URLSearchParams>, fragment?: string | null): string {
    return stringify(pathOrParsedUrl as string, query as Readonly<URLSearchParams>, fragment as string);
  }
});

export const fragmentUrlParser: IUrlParser = Object.freeze({
  parse(value: string): ParsedUrl {
    /**
     * Look for the fragment; if found then take it and discard the rest.
     * Otherwise, the entire value is the fragment.
     * Next, look for the query string and strip it away.
     * Construct the serialized URL, with the fragment as path, the query and null fragment.
     */
    const start = value.indexOf('#');
    if (start >= 0) {
      const rawFragment = value.slice(start + 1);
      value = decodeURIComponent(rawFragment);
    }
    return ParsedUrl._create(value);
  },
  stringify(pathOrParsedUrl: ParsedUrl | string, query?: Readonly<URLSearchParams>, fragment?: string | null): string {
    return `/#/${stringify(pathOrParsedUrl as string, query as Readonly<URLSearchParams>, fragment as string)}`;
  }
});
