export interface IParsedQuery {
  parameters: Record<Exclude<string, '-unnamed'>, string> | (Record<Exclude<string, '-unnamed'>, string> & Record<'-unnamed', string[]>);
  list: string[];
}

export interface IMergedParameters {
  parameters: Record<string, string>;
  list: string[];
  merged: string[] | Object;
}

export function parseQuery(query: string): IParsedQuery {
  const parameters = {};
  const list = [];
  if (!query || !query.length) {
    return { parameters: parameters, list: list };
  }
  const params = query.replace('+', ' ').split('&');
  for (const param of params) {
    const kv = param.split('=');
    const key = decodeURIComponent(kv.shift());
    if (!kv.length) {
      list.push(key);
      continue;
    }
    const value = decodeURIComponent(kv.shift());
    parameters[key] = value;
    // TODO: Deal with complex parameters such as lists and objects
  }
  return { parameters: parameters, list: list };
}

export function mergeParameters(parameters: string, query: string, specifiedParameters: string[]): IMergedParameters {
  const parsedQuery = parseQuery(query);
  const parsedParameters = parseQuery(parameters);
  const params = { ...parsedQuery.parameters, ...parsedParameters.parameters };
  const list = [...parsedQuery.list, ...parsedParameters.list];

  if (list.length && specifiedParameters && specifiedParameters.length) {
    for (const param of specifiedParameters) {
      // TODO: Support data types
      params[param] = list.shift();
    }
  }

  if (list.length && Object.keys(params).length) {
    params['-unnamed'] = list.splice(0, list.length);
  }
  let merged: string[] | Object;
  if (list.length) {
    merged = list;
  } else {
    merged = params;
  }

  return {
    parameters: params,
    list: list,
    merged: merged,
  };
}
