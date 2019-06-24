import { createTemplateDescription, escape, kebabCase, loadFromFile, parseImport, processImports } from './processing';
const buildMap = {};
/** @internal */
export function finishLoad(name, content, onLoad) {
    buildMap[name] = content;
    onLoad(content);
}
export function load(name, req, onLoad, config) {
    if (config.isBuild) {
        loadFromFile(req.toUrl(name), function (content) { finishLoad(name, content, onLoad); }, function (error) { if (onLoad.error) {
            onLoad.error(error);
        } });
    }
    else {
        req([`text!${name}`], function (text) {
            const description = createTemplateDescription(text);
            const depsToLoad = processImports(description.imports, name);
            const templateImport = parseImport(name);
            req(depsToLoad, function () {
                const templateSource = {
                    name: kebabCase(templateImport.basename),
                    template: description.template,
                    build: {
                        required: true,
                        compiler: 'default'
                    },
                    dependencies: Array.prototype.slice.call(arguments)
                };
                onLoad({ default: templateSource });
            });
        });
    }
}
export function write(pluginName, moduleName, writer, _config) {
    if (buildMap.hasOwnProperty(moduleName)) {
        const text = buildMap[moduleName];
        const description = createTemplateDescription(text);
        const depsToLoad = processImports(description.imports, moduleName);
        const depsToLoadMapped = depsToLoad.map(x => `"${x}"`).join(',');
        const templateImport = parseImport(moduleName);
        writer(`define("${pluginName}!${moduleName}", [${depsToLoadMapped}], function () {
      var templateSource = {
        name: '${kebabCase(templateImport.basename)}',
        template: '${escape(description.template)}',
        build: {
          required: true,
          compiler: 'default'
        },
        dependencies: Array.prototype.slice.call(arguments)
      };

      return { default: templateSource };
    });\n`);
    }
}
//# sourceMappingURL=view.js.map