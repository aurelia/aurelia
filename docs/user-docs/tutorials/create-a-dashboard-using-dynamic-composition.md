---
description: >-
  Learn how you can leverage dynamic composition to build dynamic user
  interfaces like dashboards.
---

# Building a widget-based dashboard

{% hint style="info" %}
**Just want the code?** You can find the code for this tutorial on GitHub [here](https://github.com/Vheissu/aurelia-2-dashboard-tutorial). Feel free to use this code as a guide or even starting point for your own Aurelia applications.
{% endhint %}

## What we will be building

A simple dashboard application using dynamic composition to render a dynamic dashboard UI.

The dashboard will be comprised of a handful of different widgets and by leveraging a configuration-based approach, you learn how you can use the `<au-compose>` element to achieve this.

{% hint style="success" %}
**Try before you buy?** See a working example of the app you will be building [here](https://jovial-ritchie-56d617.netlify.app/).
{% endhint %}

## Prerequisites

Before going any further, you should be familiar with some basic Aurelia concepts as well as some fundamental Javascript ones as well. While these are not hard prerequisites, please know that some concepts used in this tutorial out of context might be confusing or difficult to understand.

* You have familiarized yourself with the [Aurelia template syntax](broken-reference).
* You have familiarized yourself with [components in Aurelia](../getting-to-know-aurelia/components.md).
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
* The blocks we want are; a date component, a notes component for taking notes, a dog widget for displaying a random dog image, a GeoIP component that displays your IP address and estimated region data, and finally a USD exchange rate component.
* No CSS frameworks or external dependencies should be used (just CSS)

## Before we begin

We will be creating some folders inside of the generated `src` directory where our components, resources and other parts of our application will live. We will do this now to save time and get our structure properly sorted out because it'll make things easier further down.

Create the following directories inside of the `src` directory.

* `components` — this is where all of our dashboard components will reside.
* `services` — this is where all of our service singletons will live (logic for interacting with services)

## Component #1 - Date component

The first component we will be creating for our dashboard is a date component. It does one thing, it displays the current date. This will be a nice gentle introduction to creating components.

Inside of `components` create a new file called `date-component.ts`

The functionality of this component is to get the current date and then display it. So inside of it, we are not even going to use lifecycles or any other Aurelia specific concepts, this will be a basic class.

```typescript
export class DateComponent {
    date = new Date().toDateString(); 
}
```

Seriously, that's all this component is going to do. Now, we need a view for this. Unlike other components, we are not even going to create a separate view file. We can specify an inline template for our view.

We will import the `customElement` decorator and then decorate our component class. We have to specify the name (the HTML tag) and the template takes a template string. Take note of the backslash `\` this is being used to escape our interpolation as we only want Aurelia interpreting this, not Javascript.

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

## Component #2 - Dog component

In this component, we will be interacting with the public random dogs API to get an image of a random dog and display it. We will be making a request using the Fetch Client as well as binding to the returned image.

You will be introduced to the Promise controller in this component, showcasing how you can work with promises inside of your views.

Create a new file called `dog-component` inside of `src/components` and add in the following code:

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

* Making a request using the Aurelia Fetch Client (which wraps native Fetch) to the random dog API
* Because we are working with the promise controller, we handle returning the JSON on success or throwing an error if there was a failure
* By adding return to the fetch call and subsequent resolution, we either return JSON or an error

Now, we create a `dog-component.html` file inside of the `components` directory:

```markup
<div class="component dog-component" promise.bind="fetchDog()">
    <template pending>Fetching doggo...</template>
    <template then.from-view="dog">
        <img src.bind="dog.url" loading="lazy">
    </template>
    <template catch.from-view="err">
        <p>${err}</p>
    </template>
</div>
```

If you have [read up on the promise controller](https://docs.aurelia.io/getting-to-know-aurelia/introduction/built-in-template-features/promise.bind), this syntax will be familiar to you. We make the call to our `fetchDog` method, while we wait for it to resolve, the `pending` attribute will show the element it is used on. Once the promise resolves on `then.from-view` we get the return object we can work with. We then bind the returned URL `src` attribute of the image. If there is an error the `catch.from-view` will be triggered and pass our error.

## Base styling

Our dashboard application is going to be a series of components with varied sizes. Because this isn't a CSS tutorial, here are the styles to make everything look pretty. Add these into your `my-app.css` file as they will form the basis of the core dashboard styling.

If you are comfortable with CSS, feel free to change things. For the purposes of this article, this merely serves to make the dashboard feel like a dashboard and look nicer.

```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap');

* {
  position: relative;
}

body {
  background: #1E1E1E;
  color: #FFF;
  font-family: 'Open Sans', sans-serif;
}

.container {
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  height: 100vh;
  margin: 0 auto;
  padding: 50px;
  width: 100%;
}

date-component,
dog-component,
geoip-component,
notes-component,
exchange-component {
  flex-direction: column;
  padding: 1rem;
  width: 100%;
}

date-component {
  background: linear-gradient(45deg, #281dd4, #a42bff);
  border-radius: 12px;
  max-width: 500px;
}

geoip-component {
  width: auto;
}

notes-component,
exchange-component {
  max-width: 450px;
  width: auto;
}

exchange-component {
  background: linear-gradient(45deg, #d41d71, #a42bff);
  border-radius: 12px;
}

dog-component {
  max-width: 800px;
}

h3 {
  margin: 0 0 15px 0;
}

h4 {
  font-size: 40px;
  font-weight: 300;
  margin: 0 0 10px 0;
}

img {
  height: 500px;
  object-fit: cover;
  width: 100%;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

ul li {
  margin: 0 0 50px 0;
  padding: 0;
}
```

{% hint style="success" %}
**Have you had enough water today?** If not, take a moment to go get yourself a nice refreshing glass of water or take a sip from your water bottle.
{% endhint %}

## Using dynamic composition

One of Aurelia's strengths and most useful features is the ability to dynamically compose components in your applications. We will be using the `<au-compose>` element for this. Passing in a view model we will be able to dynamically render our components.

Dynamic composition is what we will be using to display our widgets. It means we don't have to import a bunch of components and reference them by their element name, we'll loop over an array of components and display them that way.

Inside of `my-app.ts` add in the following:

```typescript
import { DogComponent } from './components/dog-component';
import { DateComponent } from './components/date-component';

export class MyApp {
  public components = [
    DateComponent,
    DogComponent
  ];
}
```

* We import the two components we have created so far
* We create a new class property called `components` which is an array of our imported components
* We use an array because it allows us to change the order of components being displayed as well as remove any we don't want to show (it becomes modular)

The missing piece is now adding in the actual dynamic composition to our view. Open `my-app.html` and add in the following:

```markup
<div class="container">
    <template repeat.for="component of components">
        <au-compose containerless view-model.bind="component"></au-compose>
    </template>
</div>
```

* We add in a div with a class of container which will hold our components
* We loop over our components using `repeat.for` we do this on a `<template` element so we don't introduce any additional elements to the DOM (template elements don't get shown in the browser)
* Our `repeat.for` is the equivalent of `for (let component of components)` in Javascript
* We use the `<au-compose>` element and pass in the instance to `view-model` which will then render the component
* On `<au-compose>` we also use the `containerless` attribute which will remove any `<au-compose>` element in the DOM and only leave us with the custom element itself

If you were to run this app using `npm start` you would see something like this so far:

![](<../.gitbook/assets/image (2).png>)

## Component #3 - GeoIP component

For our third component, we are going to leverage the GeoIP API to create a component that displays information about the current user. Their IP address, approximate location and other details (only you can see your own details).

Some of this code will look familiar to you, we worked with the Aurelia Fetch Client to build our dog component (component #2), we'll be using the promise controller for this again as well because it makes working with promises in Aurelia cleaner.

Create a new file called `geoip-component.ts` inside of the `src/components` directory in your application and populate it with the following:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';

export class GeoipComponent {
    constructor(@IHttpClient private http: IHttpClient) {

    }

    getUserInfo() {
        return this.http.fetch('https://freegeoip.app/json/')
        .then(r => r.ok ? r.json() : (() => { throw new Error('Unable to contact API') }))
    }
}
```

We actually don't need to explain what is happening here, this is pretty much a copy and paste of our dog component. We explain what each piece of code is doing, so if you skipped that step, please go back before continuing

Now, let's create the view for our geoip component. Create a HTML file called `geoip-component.html` in the `src/components` directory:

```markup
<div class="component geoip-component" promise.bind="getUserInfo()">
    <template pending><p>Getting details...</p></template>

    <ul then.from-view="details">
        <li><h3>IP address:</h3> <span> ${details.ip}</span></li>
        <li><h3>Country:</h3> <span> ${details.country_name}</span></li>
        <li><h3>Timezone:</h3> <span> ${details.time_zone}</span></li>
    </ul>

    <template catch.from-view="err">
        <p>${err}</p>
    </template>
</div>
```

{% hint style="warning" %}
Using an adblocker extension in your browser? Many ad blockers will block requests to geolocation services like these. Make sure you disable it for localhost or exclude it from blocking or requests will not work.
{% endhint %}

Inside of `my-app.css` add the following CSS beneath the `dog-component` styling:

```css
geoip-component {
  grid-column: span 4;
}
```

Now, import the geoip component inside of `my-app.ts` adding it to our array of components. Your file should look like this (unless you switched up the order).

```typescript
import { GeoipComponent } from './components/geoip-component';
import { DogComponent } from './components/dog-component';
import { DateComponent } from './components/date-component';

export class MyApp {
  public components = [
    DateComponent,
    DogComponent,
    GeoipComponent
  ];
}
```

## Component #4 - Notes component

Our fourth component will be a note-taking component. It will show a simple list of notes, allow us to delete them and most importantly: allow us to add new notes. This component will not require communicating with a third-party API.

Like all the components we have created before, we start off creating two files in the `components` directory. Let's create `notes-component.ts` first as this is where most of the code will be.

Inside of `notes-component.ts` add the following:

```typescript
export class NotesComponent {
    notes = [
        'Complete Aurelia 2 dashboard tutorial. It is quite long, so remember you need to take breaks'
    ];
    note = '';

    addNote(): void {
        this.notes.unshift(this.note);
        this.note = '';
    }

    removeNote(index: number): void {
        this.notes.splice(index, 1);
    }
}
```

* First, we create a class property called `notes` which is an array of strings. These strings are our notes.
* The class property called `note` is where our in progress notes are stored (bound to a textarea)
* The `addNote` method puts the value of `note` bound to our textarea into our array, using `unshift` to push it to the beginning
* We can then set the `note` value to be an empty string (you will see the textarea empty)
* The `remoteNote` method takes a numeric index of a note
* Using `splice` on the notes array, we delete our not based on its index value

We now need the markup for our component. Create a new file called `notes-component.html` alongside our `notes-component.ts` file and add in the following:

```markup
<div class="component notes-component">

    <textarea value.bind="note" spellcheck="false"></textarea><br>
    <button type="button" click.trigger="addNote()">Add note</button>

    <ul class="notes">
        <li repeat.for="text of notes">${text} <button type="button" class="delete-btn" click.delegate="removeNote($index)">x</button></li>
    </ul>

</div>
```

* `value.bind="note"` binds the native `value` attribute on our textarea to the class property called `note` we also disable spellchecking in this field
* We add in a button with `click.trigger="addNote()"` which will call the `addNote` function every time the button is clicked
* We then create an unordered list where we loop over the `notes` array and display the value
* Inside of the `li` we also have a button with a `click.delegate` we use a delegate here because we don't know how big the list will be and delegation will create one event listener, not multiple.
* On the `click.delegate` we call `removeNote` and pass in the current index value from the loop accessible via the special property `$index`

Unlike other components, we need some specific styles for our notes component. Because conventions rock, Aurelia will automatically look for a `.css` file for any components you create. By creating a file called `notes-component.css` alongside the other files, Aurelia will see this and automatically import it for us.

Inside of `notes-component.css` add in the following styles:

```css
.delete-btn {
    background: none;
    border: none;
    color: #FF0000;
    cursor: pointer;
    font-size: 24px;
    margin: 0;
    padding: 0;
  }

  .notes li {
      margin-bottom: 10px;
  }
```

Let's update our `my-app.ts` file, this time we'll be changing the order slightly and we will also be importing our newly created notes component too.

```typescript
import { NotesComponent } from './components/notes-component';
import { GeoipComponent } from './components/geoip-component';
import { DogComponent } from './components/dog-component';
import { DateComponent } from './components/date-component';

export class MyApp {
  public components = [
    NotesComponent,
    DogComponent,
    DateComponent,
    GeoipComponent
  ];
}
```

## Component #5 - USD exchange rate component

The final component in our extravagant dashboard is an exchange rate component that displays what one US dollar will get you in other countries.

Once more, we'll be interacting with an API. And the code like in our dog component and GeoIP component will be the same except the endpoint will be different.

Create a new file called `exchange-component` in the `components` directory:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';

export class ExchangeComponent {
    constructor(@IHttpClient private http: IHttpClient) {

    }

    getExchangeData() {
        return this.http.fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(r => r.ok ? r.json() : (() => { throw new Error('Unable to fetch exchange rates') }))
    }
}
```

Like component 4 and component 2, the code is basically the same (the method name is different and the endpoint is different, but that's it).

Now, we create the view for our component `exchange-component.html`

```markup
<div class="component exchange-component" promise.bind="getExchangeData()">
    <template pending><p>Fetching data...</p></template>
    <template then.from-view="data">
        <h3>$1 USD equals:</h3>
        <ul class="amounts-list">
            <li>$${data.rates.AUD} Australian Dollars (AUD)</li>
            <li>$${data.rates.NZD} New Zealand Dollars (NZD)</li>
            <li>$${data.rates.CAD} Canadian Dollars (CAD)</li>
            <li>£${data.rates.GBP} British Pounds (GBP)</li>
        </ul>
    </template>
    <template catch.from-view="err">
        <p>${err}</p>
    </template>
</div>
```

Like the other promise based examples before this one (component 4 and component 2) we use the promise controller syntax. Inside of `then.from-view` we assign the response to a variable called `data` and then we can access the properties. In our case, we are accessing exchange rates.

Now, let's create the accompanying CSS file for our component of the same name, `exchange-component.css`

```css
.amounts-list li {
    margin-bottom: 10px;
}
```

Now, let's open up `my-app.ts` one more time and add our exchange component and change the order again:

```typescript
import { ExchangeComponent } from './components/exchange-component';
import { NotesComponent } from './components/notes-component';
import { GeoipComponent } from './components/geoip-component';
import { DogComponent } from './components/dog-component';
import { DateComponent } from './components/date-component';

export class MyApp {
  public components = [
    NotesComponent,
    GeoipComponent,
    DateComponent,
    ExchangeComponent,
    DogComponent
  ];
}
```

## Running the app

We now have a functional and styled dashboard. By running `npm start` in the application directory, you should see your application running. Here is what it should look like (will differ depending on screen sizes).

![](<../.gitbook/assets/image (1).png>)

It's not the prettiest app in the world, but we have a functional application.

## Refactoring (optional)

We have a working app, we are both happy. But, we have a lot of duplication in our code, especially when it comes to making requests to APIs. Now, we are going to be tweaking our code to make it even smaller and more testable.

This step in the tutorial is optional. You do not have to refactor, however, if you want to see ways in which we can remove code from our application and still retain its functionality, you will want to stick around for this.

Our dog, GeoIP and exchange components all make API requests, they all expect JSON to be returned. Armed with this knowledge, can create a service that can be used to make these requests for us and format the returned data.

Create a new file called `api.ts` in our `services` directory. We will then inject the Aurelia Fetch Client and create a method that accepts two parameters.

```typescript
import { IHttpClient } from '@aurelia/fetch-client';

export class Api {
    constructor(@IHttpClient private http: IHttpClient) {

    }

    fetchData(url: string, error = 'Unable to fetch data') {
        return this.http.fetch(url)
            .then(r => r.ok ? r.json() : (() => { throw new Error(error) }))
    } 
}
```

* We inject the Aurelia Fetch Client on the constructor as we did in our other components
* Because we are using TypeScript, dependencies on the constructor get automatically injected
* We create a new class method called `fetchData` which accepts the URL to call and an optional error message if the request fails.

Now, let's refactor our `dog-component.ts` we'll be injecting the API and that is it:

```typescript
import { Api } from '../services/api';

export class DogComponent {
    constructor(private api: Api) {

    }
}
```

Inside of `dog-component.html` replace the existing `promise.bind` with this one:

```markup
promise.bind="api.fetchData('https://random.dog/woof.json', 'Unable to fetch doggo :(')"
```

Because our API is injected into the view model, it becomes available to the view. We can directly call the new `fetchData` method with the URL and custom error message (if we want to provide one).

We do the same for `exchange-component.ts` refactoring to:

```typescript
import { Api } from '../services/api';

export class ExchangeComponent {
    constructor(private api: Api) {

    }
}
```

Once more, inside of `exchange-component.html` we replace the existing `promise.bind` with this one:

```markup
promise.bind="api.fetchData('https://api.exchangerate-api.com/v4/latest/USD')"
```

Last, but not least, we need to refactor `geoip-component.ts` as well (hey, you're really good at this):

```typescript
import { Api } from '../services/api';

export class GeoipComponent {
    constructor(private api: Api) {

    }
}
```

Inside of `geoip-component.html` replace the existing `promise.bind` with this one:

```
promise.bind="api.fetchData('https://freegeoip.app/json/')"
```

That's it. You've just built and lightly refactored an extensive Aurelia 2 application. Well done.
