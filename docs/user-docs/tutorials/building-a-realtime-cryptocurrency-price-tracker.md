# Building a realtime cryptocurrency price tracker

{% hint style="danger" %}
This tutorial is still in progress. It might not be in a finished state just yet, so tread carefully if you attempt to following this and get stuck.
{% endhint %}

Welcome to the Aurelia cryptocurrency price tracker tutorial. In this tutorial, you will learn how to build an Aurelia 2 application that works with the Coingecko price API to get cryptocurrency prices and refresh when they change.

## What we will be building

A cryptocurrency dashboard that updates in real-time whenever the price of cryptocurrencies changes. Think of it as a stock ticker of sorts, but for cryptocurrency.

We will be interacting with the very generous Coingecko API to get the price data which allows 10 calls per second. For this tutorial, we will be calling the API once per second.

## Create the app

We will be using TypeScript & Webpack for this tutorial as well as enabling Shadow DOM to keep our styles encapsulated. Don't worry if you're not familiar with these concepts yet, you will learn as we go. For this, we will be using the Aurelia makes command-line tool to create a new Aurelia application and to save time, passing in the options we want.

```text
npx makes aurelia crypto-prices -s dev,typescript,shadow-dom,mocha
```

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

This is just a JSON object with an array of cryptos called `coins`.

## Create an API service

A good practice when working with API's in Aurelia is to create a service \(a singleton class\) which makes the calls to the API and returns the data.

Create a new directory inside of `src` called `services` and then create a new file called `api.ts`. Now, let's inject the Aurelia Fetch Client and write a method to fetch the prices.

```typescript
import { IHttpClient } from '@aurelia/fetch-client';

export class Api {
    constructor(@IHttpClient private http: IHttpClient) {

    }

    async getPrices(ids: string[]): Promise<unknown> {
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
* We create a `getPrices` method which accepts an array of strings \(our cryptocurrencies\). We make this method async to make working with the promises that Fetch returns a lot cleaner then it would be chaining `.then` and `.catch` functions in our code.
* When dealing with `async/await`, it is good practice to wrap your calls in a `try/catch` to catch any errors that might occur \(timeouts, erreonous requests, missing credentials\).
* We then make a request to the Coingecko API passing in our cryptocurrencies. By calling the `Array.toString()` method, it will automatically create a comma separated string of values like the API expects. You could also use `.join` to do this as well.
* When making Fetch requests, the resulting Fetch call with allow us to get the response value, we know we are going to be getting JSON, so we return the `request.json()` call which is a promise.

As for errors, if we encounter them, the `catch` will capture those and we return the error value. We have everything we need now.

## Inject our service into the app

Because we used the `makes` tool, by default, `my-app.ts` and `my-app.html` will tbe the view model and view that are displayed. We will be using these files to add in our API calls and other pieces of logic.

Inside of `my-app.ts` replace the contents with the following:

```typescript
import { Api } from './services/api';

import config from './config.json';

export class MyApp {
  private prices = {};

  constructor(private api: Api) {

  }

  async binding(): Promise<void> {
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

We now have our crypto prices, let's display them. Inside of `my-app.html` \(our view for the app\) we'll reference these price values.

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

## Updating the prices

We have a working application of sorts. It's ugly but functional. We have a problem though, any price updates after the page loads won't be rendered. We need to tell our view model to update the prices for us on a regular basis.

```typescript
priceUpdate(): void {
    setInterval(async () => {
        this.prices = await this.api.getPrices(config.coins);
    }, 1000);
}
```

We poll the Coingecko API every second for updated prices and store them in the `prices` object. If any of these prices change, they are updated in the view because everything is reactively bound. This instantaneous reactive binding functionality as you will come to learn is intuitive and amazing to work with.

The code in this function is pretty self explanatory. Every 1000ms \(1 second\) call out API method and update the prices of the cryptocurrencies we are watching.

Finally, update the `binding` method with the following. We want to make sure you start our interval off when the app loads.

```typescript
  async binding(): Promise<void> {
    this.prices = await this.api.getPrices(config.coins);

    this.priceUpdate();
  }
```

