import { CustomElement } from '@aurelia/runtime';
import { createTemplateDescription, escape, kebabCase, loadFromFile, parseImport, processImports } from './processing';
const buildMap = {};
function finishLoad(name, content, onLoad) {
    buildMap[name] = content;
    onLoad(content);
}
export function load(name, req, onLoad, config) {
    if (config.isBuild) {
        loadFromFile(req.toUrl(name), function (content) { finishLoad(name, content, onLoad); }, function (err) { if (onLoad.error) {
            onLoad.error(err);
        } });
    }
    else {
        req([`text!${name}`], function (text) {
            const description = createTemplateDescription(text);
            const depsToLoad = processImports(description.imports, name);
            req(depsToLoad, function () {
                const templateImport = parseImport(name);
                const templateSource = {
                    name: kebabCase(templateImport.basename),
                    template: description.template,
                    build: {
                        required: true,
                        compiler: 'default'
                    },
                    dependencies: Array.prototype.slice.call(arguments, 1)
                };
                onLoad({ default: CustomElement.define(templateSource) });
            });
        });
    }
}
export function write(pluginName, moduleName, writer, _config) {
    if (buildMap.hasOwnProperty(moduleName)) {
        const templateImport = parseImport(moduleName);
        const text = buildMap[moduleName];
        const description = createTemplateDescription(text);
        const depsToLoad = processImports(description.imports, moduleName);
        const depsToLoadMapped = depsToLoad.map(x => `"${x}"`).join(',');
        depsToLoad.unshift('@aurelia/runtime');
        writer(`define("${pluginName}!${moduleName}", [${depsToLoadMapped}], function () {
      var Component = arguments[0].Component;
      var templateSource = {
        name: '${kebabCase(templateImport.basename)}',
        template: '${escape(description.template)}',
        build: {
          required: true,
          compiler: 'default'
        },
        dependencies: Array.prototype.slice.call(arguments, 1)
      };

      return { default: Component.element(templateSource) };
    });\n`);
    }
}
//# sourceMappingURL=component.js.map