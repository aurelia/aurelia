# The Aurelia Dist

By default, all the dist of main Aurelia packages will come in 3 variants:

| name | error | warning | logging | sourcemap | minification | description |
| - | - | - | - | - | - | - |
| **index.dev.js** | full message | ✔ | ✔ | inlined | - | For development + bug reporting |
| **index.js** | code | - | - | point to source | - | For application production build |
| **index.prod.js** | code | - | - | - | ✔ | For online IDE, vanilla app, CDN usages |

For mapping error codes to their corresponding messages, please refer to the [error messages](error-messages.md)
