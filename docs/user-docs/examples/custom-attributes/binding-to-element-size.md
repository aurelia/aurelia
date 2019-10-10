# Binding to Element Size

## Basic implementation

```typescript
import { bindable, BindingMode, customAttribute, HTMLDOM, IDOM, INode } from 'aurelia';

@customAttribute({
  name: 'rectsize',
  hasDynamicOptions: true
})
export class RectSize {

  public static inject = [INode];

  @bindable({ mode: BindingMode.fromView })
  public value!: ResizeObserverSize;

  @bindable()
  public boxSize!: 'border-box' | 'content-box';

  private observer!: ResizeObserver;

  constructor(
    private readonly element: HTMLElement
  ) {

  }

  public binding(): void {
    let observer = this.observer;
    if (observer === void 0) {
      observer = this.observer = this.createObserver();
    }
    observer.observe(this.element, { box: 'border-box' });
  }

  public unbinding(): void {
    this.observer.disconnect();
    this.observer = (void 0)!;
  }

  private createObserver(): ResizeObserver {
    return new ResizeObserver((entries) => {
      this.handleResize(entries[0]);
    });
  }

  /**
   * @internal
   */
  private handleResize(entry: ResizeObserverEntry): void {
    this.value = this.boxSize === 'content-box' ? entry.contentBoxSize : entry.borderBoxSize;
  }
}
```

## Working with polyfill

As `ResizeObserver` is still new and experimental API, it's not widely supported in all browsers. Fortunately there are a few polyfills available. For example:

* older spec, with only `contentRect`: [https://github.com/que-etc/resize-observer-polyfill](https://github.com/que-etc/resize-observer-polyfill)
* newer spec, with supports for box model options: [https://github.com/juggle/resize-observer](https://github.com/juggle/resize-observer)

To make the attribute work seamlessly with any polyfill users want to choose, we can adjust the way we get the `ResizeObserver` constructor, as shown in the following example:

```diff
export class RectSize {

+  /**
+   * Allow user to ponyfill Resize observer via this static field
+   */
+  public static ResizeObserver: ResizeObserver;


+  private createObserver(): ResizeObserver {
+    const ResizeObserverCtor = this.getResizeObserver();
-    return new ResizeObserver((entries) => {
+    return new ResizeObserverCtor((entries) => {
+      this.handleResize(entries[0]);
+    });
+  }


+  private getResizeObserver(): ResizeObserver {
+    return RectSize.ResizeObserver || window.ResizeObserver;
+  }
```

And now, our user can switch to any polyfill as the following example:

```typescript
import { RectSize } from './some-path'
import { ResizeObserver } from 'some-resize-observer-polyfill'

RectSize.ResizeObserver = ResizeObserver;
```

## Example usage

For the above implementation, the usage would be:

```markup
<form rectsize.bind="formSize">
  ...
</form>
or
<form rectsize="value.bind: formSize; box-model: content-box;">
  ...
</form>
```

## Special note:

For the polyfill at [https://github.com/que-etc/resize-observer-polyfill](https://github.com/que-etc/resize-observer-polyfill) , you cannot use `box-model` for observation option, as it follows an older spec of `ResizeObserver`. Though it is a mature polyfill, and works well so if you want to use it, slightly modify the above implementation:

```diff
  private handleResize(entry: ResizeObserverEntry): void {
-    this.value = this.boxSize === 'content-box' ? entry.contentBoxSize : entry.borderBoxSize;
+    this.value = entry.contentRect;
  }
```

