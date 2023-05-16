# Using observerLocator

The Observer Locator API allows you to watch properties in your components for changes without the need for using the `@observable` decorator. In most cases, manual observation will not be required using this API, but it is there if you want it.

## Basic observer interface

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

## Getting an observer of a property

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

## Getting an observer of an expression

It's not always sufficient to observe a single property on an object, and it's sometimes more desirable to return a computed value from the source so that subscribers of an observer don't have to perform any logic dealing with the updated values.
An example of this is the follow observation of `firstName` and `lastName` to notify full name:

```ts
const obj = { firstName: '', lastName: '' }
function notifyFullnameChanged() {
  console.alert(`${obj.firstName} ${obj.lastName}`);
}
const observer1 = observerLocator.getObserver(obj, 'firstName').subscribe({ handleChange: notifyFullnameChanged })
const observer2 = observerLocator.getObserver(obj, 'lastName').subscribe({ handleChange: notifyFullnameChanged })
```

Doing it the way above is cumber some as we need to setup 2 observers and 2 subscribers, also there's a typo risk. We can also use a getter to express a computed value,
and then observe that getter to avoid having to do heavy setup work:
```ts
const obj = { firstName: '', lastName: '', get fullName() { return `${this.firstName} ${this.lastName}` } }
const observer = observerLocator.getObserver(obj, 'fullName').subscribe({ handleChange: fullname => alert(fullname) });
```
This is not always feasible since the obj could be from a 3rd party library, or some json data from server, and the risk of having a typo `fullName` is still there.

Aurelia provides another API of creating observer to deal with this scenario, where it's more desirable to use a function/lambda expression to express the dependencies and computed value to notify the subscriber.
To use this API, replace the 2nd parameter of `getObserver` with a getter function to express the value:

```ts
const obj = { firstName: '', lastName: '' }
const observer = observerLocator.getObserver(obj, obj => `${obj.firstName} ${obj.lastName}`).subscribe({
  handleChange: fullname => alert(fullname)
});
```

{% hint %}
Sometimes it's more desirable to work with a higher level API, for this consider using [watch](./effect-observation.md#watch-effect)
{% endhint %}
