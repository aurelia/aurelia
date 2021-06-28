---
description: >-
  Learn how you can leverage dynamic composition to build dynamic user
  interfaces like dashboards.
---

# Building a widget-based dashboard

{% hint style="danger" %}
This tutorial is a work in progress and not yet complete.
{% endhint %}

## What we will be building

A simple dashboard application using dynamic composition to render a dynamic dashboard UI.

The dashboard will be comprised of a handful of different widgets and by leveraging a configuration-based approach, you learn how you can use the `<au-compose>` element to achieve this.

## Prerequisites

Before going any further, you should be familiar with some basic Aurelia concepts as well as some fundamental Javascript ones as well. While these are not hard prerequisites, please know that some concepts used in this tutorial out of context might be confusing or difficult to understand.

* You have familiarized yourself with the [Aurelia template syntax](../getting-to-know-aurelia/introduction/).
* You have familiarized yourself with [components in Aurelia](../getting-to-know-aurelia/components/).
* You are familiar with [Dependency Injection](../getting-to-know-aurelia/dependency-injection-di.md). You don't need to be a master of it, just familiar with its existence and why it matters in Aurelia.

## Create the app

When creating a new Aurelia 2 application, it is considered best practice to use the CLI. You can simply type `npx makes aurelia` to do this, but for the purposes of this tutorial, we are going to give you the shorthand syntax to do this faster.

```bash
npx makes aurelia aurelia-2-dashboard -s dev,typescript,css-module
```

For this tutorial application, we will be using TypeScript for writing our view models and CSS Modules for our CSS to keep things neat. If you are interested in using Shadow DOM, please see our other tutorial [Building a realtime cryptocurrency price tracker](building-a-realtime-cryptocurrency-price-tracker.md) to see Shadow DOM in action.

We now have the barebones Aurelia starter for the basis of our dashboard application.

## Scoping the requirements

Like all good projects, they should be well-planned and thought out. Let's determine what our dashboard will do.

* A series of dashboard blocks will be displayed to the user
* Each block is its own widget
* Blocks do not share their state, they are responsible for themselves only
* Blocks will be components rendered using the `<au-compose>` element
* The blocks we want are; a date component, a notes component for taking notes, a dog widget for displaying a random dog image, a GeoIP component that displays your IP address and estimated region data, an XKCD comic component, and finally a USD exchange rate component.
* No CSS frameworks or external dependencies should be used \(just CSS\)

## Before we begin

We will be creating some folders inside of the generated `src` directory where our components, resources and other parts of our application will live. We will do this now to save time and get our structure properly sorted out because it'll make things easier further down.

Create the following directories inside of the `src` directory.

* `components` — this is where all of our dashboard components will reside.
* `resources` — this is where all of our template resources will reside.
* `services` — this is where our code for communicating with external APIs will reside.

## Component \#1 - Date component

The first component we will be creating for our dashboard is a date component. It does one thing, it displays the current date. This will be a nice gentle introduction to creating components.

Inside of `components` create a new file called `date-component.ts`

The functionality of this component is to get the current date and then display it. So inside of it, we are not even going to use lifecycles or any other Aurelia specific concepts, this will be a basic class.

```typescript
export class DateComponent {
    date = new Date().toDateString(); 
}
```

Seriously, that's all this component is going to do. Now, we need a view for this. Unlike other components, we are not even going to create a separate view file. We can specify an inline template for our view.

We will import the `customElement` decorator and then decorator our component class. We have to specify the name \(the HTML tag\) and the template takes a template string. Take note of the backslash `\` this is being used to escape our interpolation as we only want Aurelia interpreting this, not Javascript.

```typescript
import { customElement } from 'aurelia';

@customElement({
    name: 'date-component',
    template: `<div class="component date-component"><h4>\${date}</h4></div>`
})
export class DateComponent {
    date = new Date().toDateString(); 
}
```

## Component \#2 - Dog component

In this component, we will be interacting with the public random dogs API to get an image of a random dog and display it. We will be making a request using the Fetch Client as well as binding to the returned image.

You will be introduced to the Promise controller in this component, showcasing how you can work with promises inside of your views.

```typescript
import { IHttpClient } from '@aurelia/fetch-client';

export class DogComponent {
    constructor(@IHttpClient private http: IHttpClient) {
    
    }
    
    fetchDog() {
        return this.http.fetch('https://random.dog/woof.json')
        .then(r => r.ok ? r.json() : (() => { throw new Error('Unable to fetch doggo :(') }))
    }
}
```

Inside of the `fetchDog` method we are doing the following:

* Making a request using the Aurelia Fetch Client \(which wraps native Fetch\) to the random dog API
* Because we are working with the promise controller, we handle returning the JSON on success or throwing an error if there was a failure
* By adding return to the fetch call and subsequent resolution, we either return JSON or an error

Now, we create a `dog-component.html` file inside of the `components` directory:

```markup
<div class="component dog-component" promise.bind="fetchDog()">
    <span pending>Fetching doggo...</span>
    <div then.from-view="dog">
        <img src.bind="dog.url" loading="lazy">
    </div>
</div>
```

If you have [read up on the promise controller](https://docs.aurelia.io/getting-to-know-aurelia/introduction/built-in-template-features#using-promises-in-templates-with-promise-bind), this syntax will be familiar to you. We make the call to our `fetchDog` method, while we wait for it to resolve, the `pending` attribute will show the element it is used on. Once the promise resolves on `then.from-view` we get the return object we can work with. We then bind the returned URL `src` attribute of the image.

## Some initial component and base styles

We now have a couple of components, so let's add in some styling that will make them look a bit nicer. For this, we will use CSS Grid. Each individual component will have different dimensions and styling.

Keep in mind that some of these styles will be changed, some are merely to make it look nice to show you what we have done so far.

```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap');

body {
  background: #1E1E1E;
  color: #FFF;
  font-family: 'Open Sans', sans-serif;
}

.container {
  align-items: start;
  display: grid;
  gap: 20px;
  height: 100vh;
  grid-template-columns: repeat(12, 1fr);
  margin: 0 auto;
  padding: 50px;
}

h4 {
  font-size: 40px;
  font-weight: 300;
  margin: 0 0 10px 0;
}

date-component {
  grid-column: span 3;
}

dog-component {
  color: #FFF;
  grid-column: span 4;
}

img {
  height: 500px;
  object-fit: cover;
  width: 100%;
}
```

You don't have to understand what is going on here, this styling is just to show something in the page. We will be changing these styles later on. We are adding in a nice font, some initial colours and styling for a couple of elements.

### 

