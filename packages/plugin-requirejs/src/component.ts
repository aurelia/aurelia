import { CustomElementResource } from '@aurelia/runtime';
import { createTemplateDescription, escape, kebabCase, loadFromFile, parseImport, processImports } from './processing';

const buildMap = {};

function finishLoad(name: string, content: string, onLoad: Function) {
  buildMap[name] = content;
  onLoad(content);
}

export function load(name: string, req, onLoad, config) {
  if (config.isBuild) {
    loadFromFile(req.toUrl(name),
      function(content) { finishLoad(name, content, onLoad); },
      function(err) { if (onLoad.error) { onLoad.error(err); } }
    );
  } else {
    req(['text!' + name], function(text) {
      const description = createTemplateDescription(text);
      const depsToLoad = processImports(description.imports, name);

      req(depsToLoad, function() {
        const templateImport = parseImport(name);
        const templateSource = {
          name: kebabCase(templateImport.basename),
          templateOrNode: description.template,
          build: {
            required: true,
            compiler: 'default'
          },
          dependencies: Array.prototype.slice.call(arguments, 1)
        };

        onLoad({default: CustomElementResource.define(templateSource, null)});
      });
    });
  }
}

export function write(pluginName: string, moduleName: string, write, config) {
  if (buildMap.hasOwnProperty(moduleName)) {
    const templateImport = parseImport(moduleName);
    const text = buildMap[moduleName];
    const description = createTemplateDescription(text);
    const depsToLoad = processImports(description.imports, moduleName);

    depsToLoad.unshift('@aurelia/runtime');

    write(`define("${pluginName}!${moduleName}", [${depsToLoad.map(x => `"${x}"`).join(',')}], function() {
      var Component = arguments[0].Component;
      var templateSource = {
        name: '${kebabCase(templateImport.basename)}',
        templateOrNode: '${escape(description.template)}',
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

