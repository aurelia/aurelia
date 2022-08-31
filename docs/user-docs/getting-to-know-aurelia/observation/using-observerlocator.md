# Using observerLocator

The Observer Locator API allows you to watch properties in your components for changes without the need for using the `@observable` decorator. In most cases, manual observation will not be required using this API, but it is there if you want it.

By default, an observer locator is used to create observers and subscribe to them for change notification.

**A basic observer has the following interface:**

```typescript
interface IObserver {
  subscribe(subscriber)
  unsubscribe(subscriber)
}
```

The `subscribe` method of an observer can be used to subscribe to the changes that it observes. This method takes a subscriber as its argument.

**A basic subscriber has the following interface:**

```typescript
interface ISubscriber {
  handleChange(newValue, oldValue)
}
```

An observer of an object property can be retrieved using an observer locator.

**An example of this is:**

```typescript
// getting the observer for property 'value'
const observer = observerLocator.getObserver(obj, 'value')
```

**And to subscribe to changes emitted by this observer:**

```typescript
const subscriber = {
  handleChange(newValue) {
    console.log('new value of object is:', newValue)
  }
}

observer.subscribe(subscriber)

// and to stop subscribing
observer.unsubscribe(subscriber)
```



