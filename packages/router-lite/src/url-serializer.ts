import { DI } from '@aurelia/kernel';
import { emptyQuery } from './router';

export class SerializedUrl {

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

export interface IUrlSerializer {
  serialize(value: string): SerializedUrl;
  deserialize(value: SerializedUrl): string;
}
const IUrlSerializer = DI.createInterface<IUrlSerializer>();

/**
 * Extracts the route from path.
 */
export class PathUrlSerializer implements IUrlSerializer {
  public static readonly instance = new PathUrlSerializer();
  private constructor() { }
  public serialize(value: string): SerializedUrl {
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
    return new SerializedUrl(
      value,
      queryParams != null ? queryParams : emptyQuery,
      fragment,
    );
  }

  public deserialize(value: SerializedUrl): string {
    throw new Error('Not implemented');
  }
}

export class FragmentUrlSerializer implements IUrlSerializer {
  public static readonly instance = new FragmentUrlSerializer();
  private constructor() { }
  public serialize(value: string): SerializedUrl {
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
    return new SerializedUrl(
      value,
      queryParams != null ? queryParams : emptyQuery,
      null,
    );
  }

  public deserialize(value: SerializedUrl): string {
    throw new Error('Not implemented');
  }
}
