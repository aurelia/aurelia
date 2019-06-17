import { CustomElementResource } from '@aurelia/runtime';
import { createTemplateDescription, escape, kebabCase, loadFromFile, parseImport, processImports } from './processing';
import { Require, RequireConfig, RequireOnLoad } from './types';

const buildMap: Record<string, string> = {};

function finishLoad(name: string, content: string, onLoad: (content: string) => void): void {
  buildMap[name] = content;
  onLoad(content);
}

export function load(name: string, req: Require, onLoad: RequireOnLoad, config: RequireConfig): void {
  if (config.isBuild) {
    loadFromFile(
      req.toUrl(name),
      function(content: string): void { finishLoad(name, content, onLoad); },
      function(err: Error): void { if (onLoad.error) { onLoad.error(err); } }
    );
  } else {
    req([`text!${name}`], function(text: string): void {
      const description = createTemplateDescription(text);
      const depsToLoad = processImports(description.imports, name);

      req(depsToLoad, function (): void {
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

        onLoad({default: CustomElementResource.define(templateSource)});
      });
    });
  }
}

export function write(pluginName: string, moduleName: string, writer: (content: string) => void, _config: RequireConfig): void {
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
