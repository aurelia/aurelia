Some users may want to inject their styles into the DOM like v1. There is no equivalent for this functionality in the second version so we can define our `injectStyle` function as following:

```ts
// inject-style.ts

function caseConverter(str: string): string {
  if (str.length === 0) return str;
  const isUppercase = str[0] === str[0].toUpperCase();
  const result = str
    .split(/(?=[A-Z])/)
    .join("-")
    .toLowerCase();
  return isUppercase ? `-${result}` : result;
}

// CSS object to string converter.
export function toCss(obj: any): string {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new TypeError(
      `expected an argument of type object, but got ${typeof obj}`
    );
  }
  let lines: string[] = [];
  for (let index = 0; index < Object.keys(obj).length; index++) {
    const id = Object.keys(obj)[index];
    const key = caseConverter(id);
    const value = obj[id];
    if (typeof value === "object") {
      const text = toCss(value);
      lines.push(`${id}{${text}}`);
    } else {
      lines.push(`${key}:${value};`);
    }
  }
  return lines.join("");
}

// Inject string/object style to DOM.
export function injectStyle(
  textOrObject: string | object,
  id?: string,
  overridable = true,
  hostElement: HTMLElement = document.head
) {
  if (!textOrObject || Array.isArray(textOrObject)) return;
  if (typeof textOrObject === 'string' && textOrObject.length === 0) return;
  if (id) {
    let oldStyle = document.getElementById(id);
    if (oldStyle) {
      let isStyleTag = oldStyle.tagName.toLowerCase() === "style";
      if (!isStyleTag) {
        throw new Error("The provided id does not indicate a style tag.");
      } else if (isStyleTag && overridable) {
        oldStyle.innerHTML = typeof textOrObject === "object" ? toCss(textOrObject) : textOrObject;
      }
      return;
    }
  }
  let style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = typeof textOrObject === "object" ? toCss(textOrObject) : textOrObject;
  if (id) style.id = id;
  hostElement.appendChild(style);
}
```

### toCss(obj)

A very simple object-to-css converter.

| Parameter(s) |      Description      |  Optional | Default |
|----------|:-------------|:------:|:------:|
| obj |  Object-based style | No | - |

**Returns**: a css text.

```javascript
// css-object-style.ts

export const cssObj = {
  ".main-wrapper": { flexDirection: "row", display: "flex", flex: "1" },
  "#content": { flex: "1" },
  ul: { padding: "20px 0", flex: "1" },
  li: { fontFamily: "'Lato'", color: "whitesmoke", lineHeight: "44px" }
};

let cssText = toCss(cssObj);
```

The value of `cssText` will be equal to:
 
```css
.main-wrapper {
  flex-direction: row;
  display: flex;
  flex: 1;
}
#content {
  flex: 1;
}
ul {
  padding: 20px 0;
  flex: 1;
}
li {
  font-family:'Lato';
  color: whitesmoke;
  line-height: 44px;
}
```

You can use [css-to-js transformer](https://transform.tools/css-to-js) to convert a CSS text to a JS object and use the result for `toCss(result)` directly!

There is a conventional naming approach for defining your rules. Every uppercase character will change to a hyphen and a lowercase character (`XyZ => -xy-z`). For example, If you want to achieve `-webkit-animation` you should write `WebkitAnimation` or `flexDirection` will change to `flex-direction`.

This is exactly what the `caseConverter` function does.

### injectStyle(textOrObject, id, overridable, hostElement)

A functionality to inject your text or object-based style to the html document easily!

| Parameter(s) |      Description      |  Optional | Default |
|----------|:-------------|:------:|:------:|
| textOrObject |  Text or object-based style. | No | - |
| id |  To set an id for your `<style>`, it helps you to update an specific style tag. | Yes | - |
| overridable |  If set this to `false`, your style is only injected **once** but to do this you must set an id parameter too. | Yes | true |
| hostElement |  To set your host element to inject your style into it. Useful for shadow DOM. | Yes | document.head |


```javascript
import { injectStyle } from 'inject-style';
import { cssObj } from 'css-object-style';

// Object
injectStyle(cssObj, 'my-style-tag', false);

// String
injectStyle(`
.main-wrapper {
  flex-direction: row;
  display: flex;
  flex: 1;
}
#content {
  flex: 1;
}
ul {
  padding: 20px 0;
  flex: 1;
}
li {
  font-family:'Lato';
  color: whitesmoke;
  line-height: 44px;
}
`, 'my-style-tag', false);
```