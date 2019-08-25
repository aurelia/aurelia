export function parseQuery(query) {
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
    return { parameters, list };
}
export function mergeParameters(parameters, query, specifiedParameters) {
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
    let merged;
    if (list.length) {
        merged = list;
    }
    else {
        merged = params;
    }
    return {
        namedParameters: params,
        parameterList: list,
        merged: merged,
    };
}
//# sourceMappingURL=parser.js.map