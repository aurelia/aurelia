# Consuming a Custom Element
In order to use a new component you must register your component either globally or within the component you would like to use it in.

## Globally registering an element
To register your component to be used globally within your application you will use `.register` in `main.ts`
```javascript
import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { SomeElement } from './path-to/some-element';

Aurelia
  .register(SomeElement)
  .app(MyApp)
  .start();
  ```

## Importing the element within the template
Adding your element to be used within the template is as easy as adding the following line in your `.html` file.
```html
<import from="./path-to/some-element"></import>
```
