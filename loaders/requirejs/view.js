// Note: This is a temporary hand-authored JS build of the view plugin, used for this repo's demo.
// This will go away and be part of the requirejs plugin module, once we've moved to a monorepo.
// This temp version is required for our CLI until the plugin moves into a package.
define('view', [], function() {
  var buildMap = {};
  var view = {
    escape: function(content) {
      return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
    },

    get: function(url, callback, errback) {
      var fs = require.nodeRequire('fs');

      try {
        var file = fs.readFileSync(url, 'utf8');

        //Remove BOM (Byte Mark Order) from utf8 files if it is there.
        if (file[0] === '\uFEFF') {
            file = file.substring(1);
        }

        callback(file);
      } catch (e) {
        if (errback) {
          errback(e);
        }
      }
    },

    finishLoad: function(name, content, onLoad) {
      buildMap[name] = content;
      onLoad(content);
    },

    load: function(name, req, onLoad, config) {
      if (config.isBuild) {
        var url = req.toUrl(name);
        view.get(url,
          function(content) { view.finishLoad(name, content, onLoad); },
          function(err) { if (onLoad.error) { onLoad.error(err); } }
        );
      } else {
        req(['text!' + name], function(text) {
          const description = createTemplateDescription(text);
          const depsToLoad = description.imports.map(x => {
            if (x.extension === '.html' && !x.plugin) {
              return 'component!' + relativeToFile(x.path, name) + x.extension;
            }
  
            return relativeToFile(x.path, name);
          });
  
          req(depsToLoad, function() {
            let templateSource = {
              template: description.template,
              build: {
                required: true,
                compiler: 'default'
              },
              dependencies: Array.prototype.slice.call(arguments)
            };
  
            onload({default: templateSource});
          });
        });
      }
    },

    write: function(pluginName, moduleName, write, config) {
      if (buildMap.hasOwnProperty(moduleName)) {
        const text = buildMap[moduleName];
        const description = createTemplateDescription(text);
        const depsToLoad = processImports(description.imports, moduleName);
        const templateImport = parseImport(moduleName);

        write(`define("${pluginName}!${moduleName}", [${depsToLoad.map(x => `"${x}"`).join(',')}], function() { 
          var templateSource = {
            name: '${kebabCase(templateImport.basename)}',
            template: '${view.escape(description.template)}',
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
  };

  function createTemplateDescription(template) {
    const imports = [];
    const cleanedTemplate = template.replace(/^@import\s+\'([a-zA-z\/.\-_!%&\?=0-9]*)\'\s*;/gm, (match, url) => {
      imports.push(parseImport(url));
      return '';
    });
  
    return {
      template: cleanedTemplate.trim(),
      imports
    };
  }
  
  function parseImport(value) {
    const result = {
      path: value
    };
  
    let pluginIndex = result.path.lastIndexOf('!');
    if (pluginIndex !== -1) {
      result.plugin = result.path.slice(pluginIndex + 1);
      result.path = result.path.slice(0, pluginIndex);
    } else {
      result.plugin = null;
    }
  
    let extensionIndex = result.path.lastIndexOf('.');
    if (extensionIndex !== -1) {
      result.extension = result.path.slice(extensionIndex).toLowerCase();
      result.path = result.path.slice(0, extensionIndex);
    } else {
      result.extension = null;
    }
  
    let slashIndex = result.path.lastIndexOf('/');
    if (slashIndex !== -1) {
      result.basename = result.path.slice(slashIndex + 1);
    } else {
      result.basename = result.path;
    }
  
    return result;
  }
  
  function processImports(toProcess, relativeTo) {
    return toProcess.map(x => {
      if (x.extension === '.html' && !x.plugin) {
        return 'component!' + relativeToFile(x.path, relativeTo) + x.extension;
      }
  
      var relativePath = relativeToFile(x.path, relativeTo);
      return x.plugin ? `${x.plugin}!${relativePath}` : relativePath;
    });
  }
  
  var capitalMatcher = /([A-Z])/g;
  
  function addHyphenAndLower(char) {
    return '-' + char.toLowerCase();
  }
  
  function kebabCase(name) {
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
  }
  
  function relativeToFile(name, file) {
    let fileParts = file && file.split('/');
    let nameParts = name.trim().split('/');
  
    if (nameParts[0].charAt(0) === '.' && fileParts) {
      //Convert file to array, and lop off the last part,
      //so that . matches that 'directory' and not name of the file's
      //module. For instance, file of 'one/two/three', maps to
      //'one/two/three.js', but we want the directory, 'one/two' for
      //this normalization.
      let normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
      nameParts.unshift(...normalizedBaseParts);
    }
  
    trimDots(nameParts);
  
    return nameParts.join('/');
  }
  
  function trimDots(ary) {
    for (let i = 0; i < ary.length; ++i) {
      let part = ary[i];
      if (part === '.') {
        ary.splice(i, 1);
        i -= 1;
      } else if (part === '..') {
        // If at the start, or previous value is still ..,
        // keep them so that when converted to a path it may
        // still work when converted to a path, even though
        // as an ID it is less than ideal. In larger point
        // releases, may be better to just kick out an error.
        if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
          continue;
        } else if (i > 0) {
          ary.splice(i - 1, 2);
          i -= 2;
        }
      }
    }
  }

  return view;
});
