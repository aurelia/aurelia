export interface IParsedQuery {
  parameters: Record<Exclude<string, '-unnamed'>, string> | (Record<Exclude<string, '-unnamed'>, string> & Record<'-unnamed', string[]>);
  list: string[];
}

export interface IMergedParameters {
  namedParameters: Record<string, string>;
  parameterList: string[];
  merged: string[] | Record<string, string>;
}

export function parseQuery(query: string | null | undefined): IParsedQuery {
  const parameters: Record<Exclude<string, '-unnamed'>, string> | (Record<Exclude<string, '-unnamed'>, string> & Record<'-unnamed', string[]>) = {};
  const list: string[] = [];
  if (!query || !query.length) {
    return { parameters: parameters, list: list };
  }
  const params = query.replace('+', ' ').split('&');
  for (const param of params) {
    const kv = param.split('=');
    const key = decodeURIComponent(kv.shift() as string);
    if (!kv.length) {
      list.push(key);
      continue;
    }
    const value = decodeURIComponent(kv.shift() as string);
    parameters[key] = value;
    // TODO: Deal with complex parameters such as lists and objects
  }
  return { parameters, list };
}

export function mergeParameters(parameters: string, query: string | null | undefined, specifiedParameters: string[] | null | undefined): IMergedParameters {
  const parsedQuery = parseQuery(query);
  const parsedParameters = parseQuery(parameters);
  const params = { ...parsedQuery.parameters, ...parsedParameters.parameters };
  const list = [...parsedQuery.list, ...parsedParameters.list];

  if (list.length && specifiedParameters && specifiedParameters.length) {
    for (const param of specifiedParameters) {
      // TODO: Support data types
      params[param] = list.shift() as string;
    }
  }

  if (list.length && Object.keys(params).length) {
    params['-unnamed'] = list.splice(0, list.length);
  }
  let merged: string[] | Record<string, string>;
  if (list.length) {
    merged = list;
  } else {
    merged = params;
  }

  return {
    namedParameters: params,
    parameterList: list,
    merged: merged,
  };
}
