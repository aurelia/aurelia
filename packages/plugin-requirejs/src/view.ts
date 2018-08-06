import { createTemplateDescription, escape, kebabCase, loadFromFile, parseImport, processImports } from './processing';

const buildMap = {};

/*@internal*/
export function finishLoad(name: string, content: string, onLoad: Function) {
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
      const templateImport = parseImport(name);

      req(depsToLoad, function() {
        const templateSource = {
          name: kebabCase(templateImport.basename),
          templateOrNode: description.template,
          build: {
            required: true,
            compiler: 'default'
          },
          dependencies: Array.prototype.slice.call(arguments)
        };

        onLoad({default: templateSource});
      });
    });
  }
}

export function write(pluginName: string, moduleName: string, write, config) {
  if (buildMap.hasOwnProperty(moduleName)) {
    const text = buildMap[moduleName];
    const description = createTemplateDescription(text);
    const depsToLoad = processImports(description.imports, moduleName);
    const templateImport = parseImport(moduleName);

    write(`define("${pluginName}!${moduleName}", [${depsToLoad.map(x => `"${x}"`).join(',')}], function() { 
      var templateSource = {
        name: '${kebabCase(templateImport.basename)}',
        templateOrNode: '${escape(description.template)}',
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
