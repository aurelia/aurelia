# Globals variables in template

Aurelia evaluates template expressions in a safe way and does not allow expressions to access global variables freely. For example, doing `window.alert()` or `alert()` in any expression will not evaluate the `alert` function on the window object. Though many globals are often used, which will make it awkward if there is not a way to access them directly. `JSON` is an example, it's quite commonly used in many places including both application functionalities and debugging.

To reduce boilerplate, Aurelia allows template expression to access to a fixed list of global variables that are usually needed. Those globals are as followings:

```
Infinity
NaN
isFinite
isNaN
parseFloat
parseInt
decodeURI
decodeURIComponent
encodeURI
encodeURIComponent
Array
BigInt
Boolean
Date
Map
Number
Object
RegExp
Set
String
JSON
Math
Intl
```
