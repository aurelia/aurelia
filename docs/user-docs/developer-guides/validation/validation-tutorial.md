# Validation Tutorial

## Introduction

Aurelia provides a powerful validation library that allows you to add validation to your applications. If you are new to Aurelia, we recommend visiting the [Getting Started](broken-reference) section first to familiarize yourself with the framework.&#x20;

This tutorial aims to teach you all the basics of validation. Enabling it, validation rules, conditional validation and multiple objects.

While building our form application, we will cover the following:

* How to configure validation
* Working with built-in validation rules
* Conditional logic (if this, then that)
* Highlighting input fields using a custom renderer and displaying errors
* Working with multiple objects

A working demo and code for the following tutorial can also be found [here](https://stackblitz.com/edit/au2-conventions-xk8z3e?file=src/my-app.html).

## Installation

To do this tutorial, you'll need a working Aurelia application. We highly recommend following the [Quick Start](../../getting-started/quick-install-guide.md) guide to do this. However, for this tutorial, we have a [starter Aurelia 2 application](https://stackblitz.com/edit/au2-conventions-6kuayx) ready to go that we recommend. It will allow you to follow along and live code.

Because the validation packages do not come with Aurelia out-of-the-box, you will need to install them as detailed in the [Validation section](./). The linked code environment already has these dependencies added for you.

## Enable and configure the plugin

We need to tell Aurelia we want to use the validation package by registering it in `main.ts` via the `register` method.

```typescript
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

import { MyApp } from './my-app';

Aurelia
  .register(ValidationHtmlConfiguration)
  .app(MyApp)
  .start();
```

The `ValidationHtmlConfiguration` object will configure our Aurelia application to use HTML validation and that's all we need to do to start using it.

## Create a form

Because we will be using the validation package on a form (the most common scenario with validation), we will create one in `my-app.html`

{% code title="my-app.html" %}
```html
<form>
  <div><input type="text" placeholder="First Name" value.bind="firstName & validate"></div>
  <br>
  <div><input type="text" placeholder="Last Name" value.bind="lastName & validate"></div>
  <br>
  <div><input type="number" placeholder="Age value.bind="age & validate"></div>
  <br>
  <div><input type="email" placeholder="Email Address" value.bind="email & validate"></div>
  <br>
  <div><input type="url" placeholder="http://google.com" value.bind="website & validate"></div>
  <br>
  <button type="button" click.trigger="add()">Add</button>
</form>
```
{% endcode %}

We have added in a few form input elements and binding their values to class properties that will be inside of our view-model. One thing to point out here is `& validate` which is a binding behavior that tells the validation library we want to validate these bindable values.

## Add the validation plugin

We now need to include the validation plugin in our component. We'll inject it using Dependency Injection and then create rules and implement validation logic.

{% code title="my-app.ts" overflow="wrap" %}
```typescript
import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class MyApp {
  public constructor(
    @newInstanceForScope(IValidationController) readonly validationController: IValidationController,
    @IValidationRules readonly validationRules: IValidationRules
  ) {}
}

```
{% endcode %}

`@newInstanceForScope(IValidationController)` injects a new instance of validation controller which is made available to the children of `my-app`

`IValidationRules` is what we will use to register our validation rules that we validate against in our views.

## Create validation rules

Now we have our validation plugin added to the component, let's write validation rules.

<pre class="language-typescript" data-title="my-app.ts" data-overflow="wrap"><code class="lang-typescript">import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class MyApp {
  public constructor(
    @newInstanceForScope(IValidationController)
    private validationController: IValidationController,
    @IValidationRules validationRules: IValidationRules
  ) {
<strong>    validationRules
</strong><strong>      .on(this)
</strong><strong>      .ensure('firstName')
</strong><strong>      .required()
</strong><strong>      .ensure('lastName')
</strong><strong>      .required()
</strong><strong>      .ensure('age')
</strong><strong>      .required()
</strong><strong>      .min(18)
</strong><strong>      .max(110)
</strong><strong>      .ensure('email')
</strong><strong>      .required()
</strong><strong>      .email()
</strong><strong>      .ensure('website')
</strong><strong>      .required();
</strong>  }

<strong>  public async add() {
</strong><strong>    const result = await this.validationController.validate();
</strong><strong>    if (result.valid) {
</strong><strong>    } else {
</strong><strong>      console.log(result);
</strong><strong>    }
</strong><strong>  }
</strong>}
</code></pre>

By calling the `validationRules` API, we first must tell the plugin what we are validating. In this instance, its properties on our component class hence the `on(this)` part. If you wanted to validate an object called user, you would write `on(this.user)`.

Running what we have so far will successfully validate our inputs but will provide no visual feedback.

## Display error messages

We need a way to tell the user there are errors. We can get error messages from the validation controller and display them with very little code.

{% code title="my-app.html" overflow="wrap" %}
```html
<form>
  <ul>
    <li repeat.for="error of validationController.results" if.bind="!error.valid">${error}</li>
  </ul>

  <div><input type="text" placeholder="First Name" value.bind="firstName & validate"></div>
  <br>
  <div><input type="text" placeholder="Last Name" value.bind="lastName & validate"></div>
  <br>
  <div><input type="number" placeholder="Age" value.bind="age & validate"></div>
  <br>
  <div><input type="email" placeholder="Email Address" value.bind="email & validate"></div>
  <br>
  <div><input type="url" placeholder="http://google.com" value.bind="website & validate"></div>
  <br>
  <button type="button" click.trigger="add()">Add</button>
</form>
```
{% endcode %}

Clicking the add button will now display some error messages. Try filling out the fields and see the error messages appear and disappear.

## Turning input fields red on error

A common UI pattern when adding validation is turning the input fields red to highlight error states. While the Validation plugin provides a few ways to do this, we will leverage the `validation-errors` attribute.

<pre class="language-html" data-title="my-app.html" data-overflow="wrap"><code class="lang-html">&#x3C;form>
  &#x3C;ul>
    &#x3C;li repeat.for="error of validationController.results" if.bind="!error.valid">${error}&#x3C;/li>
  &#x3C;/ul>

<strong>  &#x3C;div validation-errors.from-view="firstNameErrors">
</strong><strong>  &#x3C;input class="${firstNameErrors.length ? 'error' : ''}" type="text" placeholder="First Name" value.bind="firstName &#x26; validate">&#x3C;/div>
</strong>  &#x3C;br>
<strong>  &#x3C;div validation-errors.from-view="lastNameErrors">
</strong><strong>  &#x3C;input class="${lastNameErrors.length ? 'error' : ''}" type="text" placeholder="Last Name" value.bind="lastName &#x26; validate">&#x3C;/div>
</strong>  &#x3C;br>
<strong>  &#x3C;div validation-errors.from-view="ageErrors">
</strong><strong>  &#x3C;input class="${ageErrors.length ? 'error' : ''}" type="number" placeholder="Age" value.bind="age &#x26; validate">&#x3C;/div>
</strong>  &#x3C;br>
<strong>  &#x3C;div validation-errors.from-view="emailErrors">
</strong><strong>  &#x3C;input class="${emailErrors.length ? 'error' : ''}" type="email" placeholder="Email Address" value.bind="email &#x26; validate">&#x3C;/div>
</strong>  &#x3C;br>
<strong>  &#x3C;div validation-errors.from-view="websiteErrors">
</strong><strong>  &#x3C;input class="${websiteErrors.length ? 'error' : ''}" type="url" placeholder="http://google.com" value.bind="website &#x26; validate">&#x3C;/div>
</strong>  &#x3C;br>
  &#x3C;button type="button" click.trigger="add()">Add&#x3C;/button>
&#x3C;/form></code></pre>

We place the `validation-errors` attribute on the surrounding DIV element, then use the pattern of `propertyNameErrors` where `propertyName` is the name of our property and `Errors` is the suffix that Aurelia sees as an error pointer.

Inside `my-app.css` add a CSS class called `error`

{% code title="my-app.css" %}
```css
.error {
  border: 1px solid #ff0000;
  color: #ff0000;
}
```
{% endcode %}

## Conditional validation logic

We could end things here. Our form has validation, and it shows error messages and styling. However, we are going to implement some conditional logic. Validation rules get called when certain values meet criteria (like radio button selections).

<pre class="language-html" data-title="my-app.html" data-overflow="wrap"><code class="lang-html">&#x3C;form>
  &#x3C;ul>
    &#x3C;li repeat.for="error of validationController.results" if.bind="!error.valid">${error}&#x3C;/li>
  &#x3C;/ul>

  &#x3C;div validation-errors.from-view="firstNameErrors">
  &#x3C;input class="${firstNameErrors.length ? 'error' : ''}" type="text" placeholder="First Name" value.bind="firstName &#x26; validate">&#x3C;/div>
  &#x3C;br>
  &#x3C;div validation-errors.from-view="lastNameErrors">
  &#x3C;input class="${lastNameErrors.length ? 'error' : ''}" type="text" placeholder="Last Name" value.bind="lastName &#x26; validate">&#x3C;/div>
  &#x3C;br>
  &#x3C;div validation-errors.from-view="ageErrors">
  &#x3C;input class="${ageErrors.length ? 'error' : ''}" type="number" placeholder="Age" value.bind="age &#x26; validate">&#x3C;/div>
  &#x3C;br>
<strong>  &#x3C;div validation-errors.from-view="typeErrors">
</strong><strong>    &#x3C;label class="${typeErrors.length ? 'error' : ''}">
</strong><strong>      &#x3C;input type="radio" name="type" checked.bind="type" value="user" />
</strong><strong>      User
</strong><strong>    &#x3C;/label>
</strong><strong>    &#x3C;label class="${typeErrors.length ? 'error' : ''}">
</strong><strong>      &#x3C;input type="radio" name="type" checked.bind="type" value="customer" />
</strong><strong>      Customer
</strong><strong>    &#x3C;/label>
</strong><strong>    &#x3C;input type="hidden" value.bind="type &#x26; validate" />
</strong><strong>  &#x3C;/div>
</strong>  &#x3C;br>
  &#x3C;div validation-errors.from-view="emailErrors">
  &#x3C;input class="${emailErrors.length ? 'error' : ''}" type="email" placeholder="Email Address" value.bind="email &#x26; validate">&#x3C;/div>
  &#x3C;br>
<strong>  &#x3C;div validation-errors.from-view="websiteErrors" if.bind="type == 'user'">
</strong>  &#x3C;input class="${websiteErrors.length ? 'error' : ''}" type="url" placeholder="http://google.com" value.bind="website &#x26; validate">&#x3C;/div>
  &#x3C;br>
  &#x3C;button type="button" click.trigger="add()">Add&#x3C;/button>
&#x3C;/form></code></pre>

We have highlighted the changes to our form. We have added in a DIV with two radio inputs and a hidden input. The hidden input allows us to validate the value or the validator will see each radio input as a separate thing to validate.

We also add an `if.bind` to our website field as we are making the URL only mandatory for new users, not new customers.

<pre class="language-typescript" data-title="my-app.ts" data-overflow="wrap"><code class="lang-typescript">import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class MyApp {
  public constructor(
    @newInstanceForScope(IValidationController)
    private validationController: IValidationController,
    @IValidationRules validationRules: IValidationRules
  ) {
    validationRules
      .on(this)
      .ensure('firstName')
      .required()
      .ensure('lastName')
      .required()
      .ensure('age')
      .required()
      .min(18)
      .max(110)
      .ensure('type')
      .required()
      .ensure('email')
      .required()
      .email()
<strong>      .ensure('website')
</strong><strong>      .required()
</strong><strong>        .when(obj => obj.type === 'user')
</strong><strong>        .withMessage(`Website is required when creating a new user.`)
</strong>  }

  public async add() {
    const result = await this.validationController.validate();
    if (result.valid) {
    } else {
      console.log(result);
    }
  }
}</code></pre>

We make a slight change to our website rules by using `.when` to introduce a condition to our validation. The `obj` being returned is the object itself, allowing us to inspect other object property values.

* When the `type` value is user
* Make the `website` property mandatory
* Use `withMessage` to create a custom validation message

## Do something on successful validation

We already have the code for this part, but it's important we talk about it. In our `my-app.ts` file we created a method called `add` which calls our validation controller.

{% code title="my-app.ts" overflow="wrap" %}
```typescript
public async add() {
  const result = await this.validationController.validate();
  
  if (result.valid) {
    // Make an API call or do something here when validation passes
  } else {
    console.log(result);
  }
}
```
{% endcode %}

Calling the `validate` method on the validation controller which returns a promise allows us to check the `valid` property to determine if validation was successful or not. The `valid` value will be `true` if all validation rules pass and `false` if one or more do not. In the case of a form where we create users, we would probably call an API or something to save.

The cool thing about this is that we also get back all of the validation rules (the ones that pass and fail) on the `results` property. This allows us to do things in our code without relying on the view. An example might be to display a toast notification with an error message for one or more errors.

## Conclusion

While we only scratched the surface of what the validator can do, we have covered all of the essential aspects of validation. We highly recommend reading over the validation documentation to get a deeper understanding of the validation library.

The code above can be found in a working demo application [here](https://stackblitz.com/edit/au2-conventions-xk8z3e?file=src/my-app.html).&#x20;

{% embed url="https://stackblitz.com/edit/au2-conventions-xk8z3e?file=src/my-app.html" %}
