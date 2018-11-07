import { createTemplateDescription, escape, kebabCase, loadFromFile, parseImport, processImports } from './processing';
import { Require, RequireConfig, RequireOnLoad } from './types';

const buildMap = {};

/*@internal*/
export function finishLoad(name: string, content: string, onLoad: (content: string) => void): void {
  buildMap[name] = content;
  onLoad(content);
}

export function load(name: string, req: Require, onLoad: RequireOnLoad, config: RequireConfig): void {
  if (config.isBuild) {
    loadFromFile(
      req.toUrl(name),
      function(content: string): void { finishLoad(name, content, onLoad); },
      function(error: Error): void { if (onLoad.error) { onLoad.error(error); } }
    );
  } else {
    req([`text!${name}`], function(text: string): void {
      const description = createTemplateDescription(text);
      const depsToLoad = processImports(description.imports, name);
      const templateImport = parseImport(name);

      req(depsToLoad, function(): void {
        const templateSource = {
          name: kebabCase(templateImport.basename),
          template: description.template,
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

export function write(pluginName: string, moduleName: string, writer: (content: string) => void, _config: RequireConfig): void {
  if (buildMap.hasOwnProperty(moduleName)) {
    const text = buildMap[moduleName];
    const description = createTemplateDescription(text);
    const depsToLoad = processImports(description.imports, moduleName);
    const templateImport = parseImport(moduleName);

    writer(`define("${pluginName}!${moduleName}", [${depsToLoad.map(x => `"${x}"`).join(',')}], function() {
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
