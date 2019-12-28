export interface IParsedQuery {
  parameters: Record<Exclude<string, '-unnamed'>, string> | (Record<Exclude<string, '-unnamed'>, string> & Record<'-unnamed', string[]>);
  list: string[];
}

export interface IMergedParameters {
  namedParameters: Record<string, string>;
  parameterList: string[];
  merged: string[] | Record<string, string>;
}

export function parseQuery(query: string | null | undefined): Record<string, string> {
  if (!query || !query.length) {
    return {};
  }
  const parameters: Record<string, string> = {};
  // TODO: Deal with complex parameters such as lists and objects
  const params: string[] = query.replace('+', ' ').split('&');
  for (const param of params) {
    const [key, value] = param.split('=');
    parameters[decodeURIComponent(key)] = decodeURIComponent(value !== void 0 ? value : key);
  }
  return parameters;
}
