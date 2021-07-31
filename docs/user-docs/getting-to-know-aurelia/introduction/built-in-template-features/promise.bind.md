---
description: Working with promises inside of your views
---

# promise.bind

When working with promises in Aurelia, previously in version 1 you had to resolve them in your view model and then pass the values to your view templates. It worked, but it meant you had to write code to handle those promise requests. In Aurelia 2 we can work with promises directly inside of our templates.

The `promise.bind` template controller allows you to use `then`, `pending` and `catch` in your views removing unnecessary boilerplate.

In the following example, notice how we have a parent `div` with the `promise.bind` binding and then a method called `fetchAdvice`? Followed by other attributes inside `then.from-view` and `catch.from-view` which handle both the resolved value as well as any errors.

Ignore the `i` variable being incremented, this is only there to make Aurelia fire off a call to our `fetchAdvice` method as it sees the parameter value has changed.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<let i.bind="0"></let>

<div promise.bind="fetchAdvice(i)">
  <span pending>Fetching advice...</span>
  <span then.from-view="data">
    Advice id: ${data.slip.id}<br>
    ${data.slip.advice}
    <button click.trigger="i = i+1">try again</button>
  </span>
  <span catch.from-view="err">
    Cannot get an addvice, error: ${err}
    <button click.trigger="i = i+1">try again</button>
  </span>
</div>
```
{% endtab %}

{% tab title="my-app.ts" %}
```text
export class MyApp {
  fetchAdvice() {
    return fetch("https://api.adviceslip.com/advice")
      .then(r => r.ok ? r.json() : (() => { throw new Error('Unable to fetch NASA APOD data') }))
  }
}
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
The parameter `i` passed to the method `fetchAdvice()` call in the template is for refreshing binding purposes. It is not used in the method itself. This is because method calls in Aurelia are considered pure, and will only called again if any of its parameter has changes.
{% endhint %}

