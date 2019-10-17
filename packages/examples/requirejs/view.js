// Note: This is a temporary hand-authored JS build of the view plugin, used for this repo's demo.
// This will go away and be part of the requirejs plugin module, once we've moved to a monorepo.
// This temp version is required for our CLI until the plugin moves into a package.
define("view", [], function() {
  var buildMap = {};
  var view = {
    escape: function escape(content) {
      return content
        .replace(/(['\\])/g, "\\$1")
        .replace(/[\f]/g, "\\f")
        .replace(/[\b]/g, "\\b")
        .replace(/[\n]/g, "\\n")
        .replace(/[\t]/g, "\\t")
        .replace(/[\r]/g, "\\r")
        .replace(/[\u2028]/g, "\\u2028")
        .replace(/[\u2029]/g, "\\u2029");
    },

    get: function get(url, callback, errback) {
      var fs = require.nodeRequire("fs");

      try {
        var file = fs.readFileSync(url, "utf8");

        //Remove BOM (Byte Mark Order) from utf8 files if it is there.
        if (file[0] === "\uFEFF") {
          file = file.substring(1);
        }

        callback(file);
      } catch (e) {
        if (errback) {
          errback(e);
        }
      }
    },

    finishLoad: function finishLoad(name, content, onLoad) {
      buildMap[name] = content;
      onLoad(content);
    },

    load: function load(name, req, onLoad, config) {
      if (config.isBuild) {
        var url = req.toUrl(name);
        view.get(
          url,
          function(content) {
            view.finishLoad(name, content, onLoad);
          },
          function(err) {
            if (onLoad.error) {
              onLoad.error(err);
            }
          }
        );
      } else {
        req(["text!" + name], function(text) {
          var description = createTemplateDescription(text);
          var depsToLoad = description.imports.map(function(x) {
            if (x.extension === ".html" && !x.plugin) {
              return "component!" + relativeToFile(x.path, name) + x.extension;
            }

            return relativeToFile(x.path, name);
          });

          req(depsToLoad, function() {
            var templateSource = {
              template: description.template,
              build: {
                required: true,
                compiler: "default"
              },
              dependencies: Array.prototype.slice.call(arguments)
            };

            onload({ default: templateSource });
          });
        });
      }
    },

    write: function write(pluginName, moduleName, _write, config) {
      if (Object.prototype.hasOwnProperty.call(buildMap, moduleName)) {
        var text = buildMap[moduleName];
        var description = createTemplateDescription(text);
        var depsToLoad = processImports(description.imports, moduleName);
        var templateImport = parseImport(moduleName);

        _write(
          'define("' +
            pluginName +
            "!" +
            moduleName +
            '", [' +
            depsToLoad
              .map(function(x) {
                return '"' + x + '"';
              })
              .join(",") +
            "], function() { \n          var templateSource = {\n            name: '" +
            kebabCase(templateImport.basename) +
            "',\n            template: '" +
            view.escape(description.template) +
            "',\n            build: {\n              required: true,\n              compiler: 'default'\n            },\n            dependencies: Array.prototype.slice.call(arguments)\n          };\n\n          return { default: templateSource };\n        });\n"
        );
      }
    }
  };

  function createTemplateDescription(template) {
    var imports = [];
    var cleanedTemplate = template.replace(
      /^@import\s+\'([a-zA-Z\/.\-_!%&\?=0-9]*)\'\s*;/gm,
      function(match, url) {
        imports.push(parseImport(url));
        return "";
      }
    );

    return {
      template: cleanedTemplate.trim(),
      imports: imports
    };
  }

  function parseImport(value) {
    var result = {
      path: value
    };

    var pluginIndex = result.path.lastIndexOf("!");
    if (pluginIndex !== -1) {
      result.plugin = result.path.slice(pluginIndex + 1);
      result.path = result.path.slice(0, pluginIndex);
    } else {
      result.plugin = null;
    }

    var extensionIndex = result.path.lastIndexOf(".");
    if (extensionIndex !== -1) {
      result.extension = result.path.slice(extensionIndex).toLowerCase();
      result.path = result.path.slice(0, extensionIndex);
    } else {
      result.extension = null;
    }

    var slashIndex = result.path.lastIndexOf("/");
    if (slashIndex !== -1) {
      result.basename = result.path.slice(slashIndex + 1);
    } else {
      result.basename = result.path;
    }

    return result;
  }

  function processImports(toProcess, relativeTo) {
    return toProcess.map(function(x) {
      if (x.extension === ".html" && !x.plugin) {
        return "component!" + relativeToFile(x.path, relativeTo) + x.extension;
      }

      var relativePath = relativeToFile(x.path, relativeTo);
      return x.plugin ? x.plugin + "!" + relativePath : relativePath;
    });
  }

  var capitalMatcher = /([A-Z])/g;

  function addHyphenAndLower(char) {
    return "-" + char.toLowerCase();
  }

  function kebabCase(name) {
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(
      capitalMatcher,
      addHyphenAndLower
    );
  }

  function relativeToFile(name, file) {
    var fileParts = file && file.split("/");
    var nameParts = name.trim().split("/");

    if (nameParts[0].charAt(0) === "." && fileParts) {
      //Convert file to array, and lop off the last part,
      //so that . matches that 'directory' and not name of the file's
      //module. For instance, file of 'one/two/three', maps to
      //'one/two/three.js', but we want the directory, 'one/two' for
      //this normalization.
      var normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
      nameParts.unshift.apply(
        nameParts,
        _toConsumableArray(normalizedBaseParts)
      );
    }

    trimDots(nameParts);

    return nameParts.join("/");
  }

  function trimDots(ary) {
    for (var i = 0; i < ary.length; ++i) {
      var part = ary[i];
      if (part === ".") {
        ary.splice(i, 1);
        i -= 1;
      } else if (part === "..") {
        // If at the start, or previous value is still ..,
        // keep them so that when converted to a path it may
        // still work when converted to a path, even though
        // as an ID it is less than ideal. In larger point
        // releases, may be better to just kick out an error.
        if (i === 0 || (i === 1 && ary[2] === "..") || ary[i - 1] === "..") {
          continue;
        } else if (i > 0) {
          ary.splice(i - 1, 2);
          i -= 2;
        }
      }
    }
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  return view;
});
