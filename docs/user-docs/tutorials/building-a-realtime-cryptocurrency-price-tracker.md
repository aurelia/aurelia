---
description: >-
  Learn how to work with Aurelia's reactive binding system to work with frequent
  data changes.
---

# Building a realtime cryptocurrency price tracker

Welcome to the Aurelia crypto price checker tutorial. In this tutorial, you will learn how to build an Aurelia 2 application that works with the Coingecko price API to get cryptocurrency prices and refresh when they change.

{% hint style="info" %}
**Just want the code?** You can find the code for this tutorial on GitHub [here](https://github.com/Vheissu/aurelia-crypto-prices). Feel free to use this code as a guide or even starting point for your own Aurelia applications.
{% endhint %}

## What we will be building

A cryptocurrency dashboard that updates in real-time whenever the price of cryptocurrencies changes. Think of it as a stock ticker of sorts, but for cryptocurrency.

We will be interacting with the very generous Coingecko API to get the price data which allows 10 calls per second. For this tutorial, we will be calling the API once per second.

This tutorial will teach you how to work with Aurelia's binding system, briefly touch on Dependency Injection, show you how to make an API request, how to organize your code and how to create a value converter to format some currency values for display.

{% hint style="success" %}
A demo of the application you will be building can be found [here](https://vheissu.github.io/aurelia-crypto-prices/dist/).
{% endhint %}

## Prerequisites

Before going any further, you should be familiar with some basic Aurelia concepts as well as some fundamental Javascript ones as well. While these are not hard prerequisites, please know that some concepts used in this tutorial out of context might be confusing or difficult to understand.

* You have familiarized yourself with the [Aurelia template syntax](broken-reference).
* You are somewhat familiar with [component lifecycles](../getting-to-know-aurelia/components/component-lifecycles.md) (we will be using `binding` in this tutorial).
* You are familiar with [Aurelia value converters](../getting-to-know-aurelia/components/value-converters.md) and how they can be used to transform data.
* You are familiar with [Dependency Injection](../getting-to-know-aurelia/dependency-injection-di.md). You don't need to be a master of it, just familiar with its existence and why it matters in Aurelia.
* You are familiar with `async/await` syntax. A great resource for learning can be found [here](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async\_await).

## Create the app

We will be using TypeScript & Webpack for this tutorial as well as enabling Shadow DOM to keep our styles encapsulated. Don't worry if you're not familiar with these concepts yet, you will learn as we go.

For this, we will be using the Aurelia `makes` command-line tool to create a new Aurelia application and to save time, passing in the options we want.

```
npx makes aurelia crypto-prices -s dev,typescript,shadow-dom,mocha
```

This is shorthand syntax to tell the Aurelia CLI to create a new project configured with TypeScript, Shadow DOM for style encapsulation and Mocha for unit testing (we won't be writing tests in this tutorial).

## Create our configuration file

We will now create a `.json` file containing the cryptocurrencies we want to monitor.

Inside of the `src` directory create a new file called `config.json` and save it. We will be watching six cryptocurrencies for this tutorial, but feel free to add more if you like.

```javascript
{
    "coins": [
        "bitcoin",
        "ethereum",
        "tether",
        "binancecoin",
        "dogecoin",
        "cardano",
        "ripple"
    ]
}
```

This is just a JSON object with an array of cryptos called `coins`. Feel free to add in your own cryptocurrencies to this file, just make sure they conform to the coin list on Coingecko.

## Create an API service

A good practice when working with API's in Aurelia is to create a service (a singleton class) that makes the calls to the API and returns the data. This keeps the logic separate from our view models, it also allows it to be tested and is just a good habit to get into.

Create a new directory inside of `src` called `services` and then create a new file called `api.ts`. Now, let's inject the Aurelia Fetch Client and write a method to fetch the prices.

```typescript
import { IHttpClient } from '@aurelia/fetch-client';

export class Api {
    constructor(@IHttpClient private http: IHttpClient) {

    }

    async getPrices(ids: string[]) {
        try {
            const request = await this.http.fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.toString()}&vs_currencies=usd`);

            return request.json();
        } catch (e) {
            return e;
        }
    }
}
```

Let's go over this line-by-line. Firstly, this is TypeScript and it looks/works very similar to Javascript, except it aims to provide some safety by alerting you to simple mistakes or errors before you build or deploy them.

* We import the the `IHttpClient` interface which we will inject into our app on the `constructor` method. The benefit of using TypeScript is you get auto injection instead of needing to manually inject the client. The Aurelia Fetch Client wraps the native Fetch API and makes it more "Aureliafied".
* We create a `getPrices` method which accepts an array of strings (our cryptocurrencies). We make this method async to make working with the promises that Fetch returns a lot cleaner then it would be chaining `.then` and `.catch` functions in our code.
* When dealing with `async/await`, it is good practice to wrap your calls in a `try/catch` to catch any errors that might occur (timeouts, erreonous requests, missing credentials).
* We then make a request to the Coingecko API passing in our cryptocurrencies. By calling the `Array.toString()` method, it will automatically create a comma separated string of values like the API expects. You could also use `.join` to do this as well.
* When making Fetch requests, the resulting Fetch call with allow us to get the response value, we know we are going to be getting JSON, so we return the `request.json()` call which is a promise.

As for errors, if we encounter them, the `catch` will capture those and we return the error value. We have everything we need now.

## Inject our service into the app

Because we used the `makes` tool, by default, `my-app.ts` and `my-app.html` will be the view model and view that are displayed. We will be using these files to add in our API calls and other pieces of logic.

Inside of `my-app.ts` replace the contents with the following:

```typescript
import { Api } from './services/api';

import config from './config.json';

export class MyApp {
  private prices = {};

  constructor(private api: Api) {

  }

  async binding() {
    this.prices = await this.api.getPrices(config.coins);
  }
}
```

* We import our newly created API service as well as the `config.json` file we created in the first step as `config`
* We initialize an empty object on our class called `prices` which will store our price data
* By specifying `api` on our `constructor` we automatically inject this service into our class
* We specify a component lifecycle hook called `binding` which we make asynchronous
* Inside of `binding` we make a call to our `getPrices` method and store the value in our class property `prices`
* The returned value is an object

## Displaying the data

We now have our crypto prices, let's display them. Inside of `my-app.html` (our view for the app) we'll reference these price values.

```markup
<div class="panels">
    <div class="panel"><h4>Bitcoin</h4> ${prices.bitcoin.usd}</div>
    <div class="panel"><h4>Ethereum</h4> ${prices.ethereum.usd}</div>
    <div class="panel"><h4>Tether</h4> ${prices.tether.usd}</div>
    <div class="panel"><h4>Binance Coin</h4> ${prices.binancecoin.usd}</div>
    <div class="panel"><h4>Dogecoin</h4> ${prices.dogecoin.usd}</div>
    <div class="panel"><h4>Cardano</h4> ${prices.cardano.usd}</div>
    <div class="panel"><h4>Ripple</h4> ${prices.ripple.usd}</div>
</div>
```

If you have brushed up on Aurelia's template syntax, then this will look familiar. We are using interpolation to display values, but do you notice something? Prices is the object we defined inside of our view model. We are then accessing each property of this object inside of the view.

We know that the value inside of `${}` is evaluated by Aurelia. In this instance, we are referencing our `prices` object and we know for each cryptocurrency we are watching, that it returns a property followed by another child property for the price called `usd`.

## Updating the data

We have a working application of sorts. It's not pretty, but it's functional. We have a problem though, any price updates after the page loads won't be rendered. Because these are price values, we want to make sure the user always has the most up to date information. We need to tell our view model to update the prices for us on a regular basis.

```typescript
priceUpdate() {
    setInterval(async () => {
        this.prices = await this.api.getPrices(config.coins);
    }, 1000);
}
```

And add the `priceUpdate()` call to binding function.

```typescript
async binding() {
    this.prices = await this.api.getPrices(config.coins);

    this.priceUpdate();
}
```

We poll the Coingecko API every second to update prices and store it in the `prices` object. If any of these prices change, they are updated in the view because everything is reactively bound. Aurelia is watching this object and the properties we've bound to in our view. We just use a basic `setInterval` to continuously poll the server, feel free to adjust the frequency.

## Seeing what we have so far

We have the basis of a functional web application that we can now run. Open up a Command Prompt/Terminal window and navigate to your project directory, then run the `start` command:

```
npm run start
```

This will run the Aurelia development server and a browser window/tab should open with your application running on the default port `9000`. Provided the Coingecko API is working, you should see some unformatted prices in the view.

## Making currencies look pretty using a value converter

You might have noticed our prices are being displayed, but they're not formatted. At the time of this tutorial, the price of 1 Bitcoin was $34,354.00 USD, however, it is being displayed without currency formatting as 34354.

So, now we are going to create a value converter using the [Internationalization API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Intl) to format our currency values as properly formed values in our view.

Inside of `src` create a new folder called `resources` and then inside of `resources` another folder called `value-converters`. It is considered best practice to have your resources inside of a resources/components folder like this. Create a new file called `currency-value-converter.ts`.

To understand what this value converter is doing, you can read about value converters [here](../getting-to-know-aurelia/components/value-converters.md).

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('currency')
export class CurrencyValueConverter {
    toView(value) {
        if (!value) {
            return value;
        }

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        return formatter.format(value);
    }
}
```

We are not going to be going into detail about the [Internationalization API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Intl), but it is highly recommended you read up on it as this is intended to be the standard way to work with dates, times, currencies and other types of localization data on the web.

### Import and use our new value converter

Now, to use this we have to register it with Dependency Injection. This tells Aurelia our value converter exists and we have a couple of different options. In this tutorial, we will be including it from within our view using the `import` element, but you can also register it inside of the view model or globally inside of `main.ts`.

If you want to learn about other ways you can inject dependencies, consult the documentation on components.

Open up `my-app.html` again and add in the following:

```markup
<import from="./resources/value-converters/currency-value-converter"></import>

<div class="panels">
    <div class="panel"><h4>Bitcoin</h4> ${prices.bitcoin.usd | currency}</div>
    <div class="panel"><h4>Ethereum</h4> ${prices.ethereum.usd | currency}</div>
    <div class="panel"><h4>Tether</h4> ${prices.tether.usd | currency}</div>
    <div class="panel"><h4>Binance Coin</h4> ${prices.binancecoin.usd | currency}</div>
    <div class="panel"><h4>Dogecoin</h4> ${prices.dogecoin.usd | currency}</div>
    <div class="panel"><h4>Cardano</h4> ${prices.cardano.usd | currency}</div>
    <div class="panel"><h4>Ripple</h4> ${prices.ripple.usd | currency}</div>
</div>
```

This looks the same as it did earlier, except we are importing our new value converter. You might also notice we are using the value converter syntax with a pipe `|` followed by `currency` which is the name of our value converter.

If you still have the app running, it should automatically refresh with the new changes and you should now see properly formatted currency values (complete with a dollar sign and thousand separators).

## Styling it with Bootstrap

We could have ended the tutorial in the previous step, but aren't you itching to make it look nicer? Using Bootstrap 5 and some simple markup, we can.

To install Bootstrap, in the project directory run `npm install bootstrap`

### Configuring Shared Styles for Shadow DOM

Unlike conventional web applications, we are using Shadow DOM to keep styles encapsulated. This means when working with third party global CSS libraries like Bootstrap, you need to make them shared styles.

Fortunately, Aurelia already helps cater for this in your apps. Inside of `main.ts` you will notice some commented out code and notes talking about shared styles.

We need to import Bootstrap' CSS first at the top of the file:

```typescript
import bootstrap from 'bootstrap/dist/css/bootstrap.css';
```

Now, uncomment the `.register` code already present in `main.ts`. Also make sure you replaced `shared` with `bootstrap` and uncomment the `StyleConfiguration` import from the `aurelia` package at the top as well.

Your `main.ts` file should look pretty much identical to this one:

```typescript
import Aurelia, { StyleConfiguration } from 'aurelia';
import { MyApp } from './my-app';

import bootstrap from 'bootstrap/dist/css/bootstrap.css';

Aurelia
  .register(StyleConfiguration.shadowDOM({
    // optionally add the shared styles for all components
    sharedStyles: [bootstrap]
  }))
  .app(MyApp)
  .start();
```

This now injects Bootstrap styles into all of our Shadow DOM components. The only downside is the global styles targeting elements like `html` or `body` do not get carried over (an intentional limitation of Shadow DOM). However, you can fix this by adding the Bootstrap CSS into the header of our `index.html` if you want those. Or, you can add them in yourself. If you want them, add the Bootstrap CDN include in the header of `index.html`. You can get the most up to date style include [here](https://getbootstrap.com/docs/5.0/getting-started/introduction/).

```markup
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
```

### Update the markup

Now we have Bootstrap added, it's time to update the markup in `my-app.html` to add the data into a styled table. This is all purely markup, so we are not using any new Aurelia concepts here. You can safely copy and paste this.

```markup
<import from="./resources/value-converters/currency"></import>

<div class="container">
    <h1 class="mt-5">Crypto Prices</h1>

    <table class="table table-striped mt-5">
        <thead class="table-dark">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Price (USD)</th>
            </tr>
          </thead>
        <tbody>
            <tr>
                <td><strong>Bitcoin</strong></td>
                <td>${prices.bitcoin.usd | currency}</td>
            </tr>
            <tr>
                <td><strong>Ethereum</strong></td>
                <td>${prices.ethereum.usd | currency}</td>
            </tr>
            <tr>
                <td><strong>Tether</strong></td>
                <td>${prices.tether.usd | currency}</td>
            </tr>
            <tr>
                <td><strong>Binance Coin</strong></td>
                <td>${prices.binancecoin.usd | currency}</td>
            </tr>
            <tr>
                <td><strong>Dogecoin</strong></td>
                <td>${prices.dogecoin.usd | currency}</td>
            </tr>
            <tr>
                <td><strong>Cardano</strong></td>
                <td>${prices.cardano.usd | currency}</td>
            </tr>
            <tr>
                <td><strong>Ripple</strong></td>
                <td>${prices.ripple.usd | currency}</td>
            </tr>
        </tbody>
    </table>
</div>
```

## Conclusion

You just created an Aurelia application that utilized a few common concepts. All of the code for this tutorial can be found on GitHub [here](https://github.com/Vheissu/aurelia-crypto-prices). Feel free to do whatever you want with this, use it as a guide or even starting point for your own applications.

* Reactive binding using interpolation to display values
* Aurelia's dependency injection to include a separate file that handled our API calls
* How to transform values in your view using value converters (taking one value and making it something else)
* How to work with Shadow DOM and specifically, what to do in the case of global style packages like Bootstrap
* How to work with the Fetch client to make requests as well as `async/await` to work with promises in a cleaner way.

{% hint style="success" %}
A working example of this tutorial can be found [here](https://vheissu.github.io/aurelia-crypto-prices/dist/).
{% endhint %}
