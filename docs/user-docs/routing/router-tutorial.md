# Router Tutorial

## Introduction

Aurelia comes with a powerful fully-featured router without the need to install any additional dependencies. If you are new to Aurelia, we recommend visiting the Getting Started section first to familiarise you with the framework.

You are here because you want to familiarize yourself with the router, so we'll make this quick. At the end of this tutorial, you will be familiar with all the concepts and APIs you need to add routing into your Aurelia applications.

**While building our recipe application, we will cover the following:**

* How to create and configure routes
* Navigating with `load` in your views as well as view-models
* Styling active links
* Programmatically navigating using router APIs
* Working with route parameters

A working demo and code for the following tutorial can also be found [here](https://stackblitz.com/edit/au2-conventions-n56ej9).

## Installation

To do this tutorial, you'll need a working Aurelia application. We highly recommend following the [Quick Start](../getting-started/quick-install-guide.md) guide to scaffold an application. However, for this tutorial, we have a [starter Aurelia 2 application](https://stackblitz.com/edit/au2-conventions-szx4j9) ready to go that we recommend. It will allow you to follow along and live code.

As you will see, it's a boring application with no routing or anything exciting. All it says is Recipes (hardly a recipe application).

## Add routes and a viewport

The viewport is where our loaded routes are dynamically loaded into. When we click on a route, the `<au-viewport>` element will be populated with the requested component.

Open `my-app.html` and add in the `<au-viewport>` and some navigation links.

<pre class="language-html" data-title="my-app.html"><code class="lang-html">&#x3C;div>
  &#x3C;h1>Recipes&#x3C;/h1>
  
<strong>  &#x3C;nav>
</strong>    &#x3C;a load="/">Home&#x3C;/a>&#x26;nbsp;&#x26;nbsp;
<strong>    &#x3C;a load="/recipes">Recipes&#x3C;/a>
</strong>  &#x3C;/nav>
  
<strong>  &#x3C;au-viewport>&#x3C;/au-viewport>
</strong>&#x3C;/div>
</code></pre>

This won't do anything just yet because we haven't enabled routing or created any routes.

## Enable routing

Let's go into `main.ts` and configure Aurelia to use routing. Import the `RouterConfiguration` object and pass it to Aurelia's `register` method.

We also configure the router to use push-state routing instead of the hash-based router. This gives us cleaner URLs.

<pre class="language-typescript" data-title="main.ts"><code class="lang-typescript">import Aurelia from 'aurelia';
<strong>import { RouterConfiguration } from '@aurelia/router';
</strong>import { MyApp } from './my-app';

Aurelia
<strong>  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
</strong>  .app(MyApp)
  .start();
</code></pre>

## Create some routes

Now that we have a viewport and the router enabled let's create some routes. We will start by adding our routes to our root `my-app.ts` component.

<pre class="language-typescript"><code class="lang-typescript">export class MyApp {
<strong>  static routes = [
</strong>    {
<strong>      path: '',
</strong>      component: '',
<strong>      title: 'Home',
</strong>    },
<strong>    {
</strong>      path: 'recipes',
<strong>      component: '',
</strong>      title: 'Recipes',
<strong>    },
</strong>    {
<strong>      path: 'recipes/:recipeId',
</strong>      component: '',
<strong>      title: 'Recipe',
</strong>    },
<strong>  ];
</strong>}
</code></pre>

The important thing to note here is that we are not specifying a component to load for these routes. We will do that shortly, but the routing structure is what we are creating here.

The first route has an empty `path` , which means it's a default route (the router will load this first if no other route is requested). The second route `recipes` tells the router when the user visits `/recipes` to load our recipes component. Lastly, the `recipes/:recipeId` route has a route parameter that allows us to load specific recipes.

## Create some components

We now need to create three components for our routes: the homepage, recipes page, and recipe detail page.

Unlike other frameworks and libraries, Aurelia works on the premise of a view-and-view model. If you familiarize yourself with the Getting Started section, you would already be familiar with these concepts.

**Let's create the homepage first:**

{% code title="home-page.ts" %}
```typescript
export class HomePage {
}
```
{% endcode %}

{% code title="home-page.html" overflow="wrap" %}
```html
<p>Welcome to flavortown. Aurelia Recipes is the only recipe application you will need to manage your recipes.</p>
```
{% endcode %}

**Let's create the recipes page:**

{% code title="recipes-page.ts" overflow="wrap" %}
```typescript
export class RecipesPage {
}
```
{% endcode %}

{% code title="recipes-page.html" overflow="wrap" %}
```html
<p>Your recipes. In one place.</p>
```
{% endcode %}

**Let's create the recipe detail page:**

{% code title="recipe-detail.ts" overflow="wrap" %}
```typescript
export class RecipeDetail {
}
```
{% endcode %}

{% code title="recipe-detail.html" overflow="wrap" %}
```html
<p>This is a recipe.</p>
```
{% endcode %}

Lastly, let's import our components in `my-app.ts` for the routes to load them.

<pre class="language-typescript" data-title="my-app.ts" data-overflow="wrap"><code class="lang-typescript">import { HomePage } from './home-page';
<strong>import { RecipesPage } from './recipes-page';
</strong>import { RecipeDetail } from './recipe-detail';

export class MyApp {
  static routes = [
    {
      path: '',
<strong>      component: HomePage,
</strong>      title: 'Home',
    },
    {
      path: '/recipes',
<strong>      component: RecipesPage,
</strong>      title: 'Recipes',
    },
    {
      path: '/recipes/:recipeId',
<strong>      component: RecipeDetail,
</strong>      title: 'Recipe',
    },
  ];
}
</code></pre>

## Listing the recipes

In a non-tutorial application, you would have your API and server providing this data. But, for our tutorial will use a public recipe API instead. We could use mock data, but it would be a lot of data for a recipe application.

The MealDB is a fantastic free meal API that can give us recipes. We will use the [Aurelia Fetch Client](broken-reference) to get this data, which wraps the native Fetch API.

In `recipes-page.ts` add the following to the component view model:

<pre class="language-typescript" data-title="recipes-page.ts" data-overflow="wrap"><code class="lang-typescript">import { HttpClient } from '@aurelia/fetch-client';

export class RecipesPage {
<strong>    private http: HttpClient = new HttpClient();
</strong>    private recipes = [];
    
<strong>    async bound() {
</strong>        const response = await this.http.fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=b`);
<strong>        
</strong>        const result = await response.json();
<strong>        
</strong>        this.recipes = result.meals;
<strong>    }
</strong>}
</code></pre>

We've loaded the recipes. Now it's time to display them. Open `recipes-page.html` and add in the following:

```html
<ul>
    <li repeat.for="recipe of recipes"><a load="/recipes/${recipe.idMeal}">${recipe.strMeal}</a></li>
</ul>
```

We use Aurelia's `repeat.for` functionality to loop over the recipes. But take notice of the link with `load` attribute. Aurelia Router sees this and knows this is a route. We are providing the recipe detail route with the ID of the recipe.

It's not pretty, but we now have a list of recipes.

## Add in support for 404 fallback

Sometimes a user might attempt to visit a recipe or page that doesn't exist. You might want to redirect the user or display a 404 page in those situations.

Let's create another component and call it `fourohfour-page`

{% code title="fourohfour-page.ts" overflow="wrap" %}
```typescript
export class 404Page {
}
```
{% endcode %}

{% code title="fourohfour-page.html" overflow="wrap" %}
```html
<h1>Oops!</h1>
<p>Sorry, that link doesn't exist.</p>
```
{% endcode %}

We then specify on our `<au-viewport>` what our fallback is. We need to import this 404 component to use it.

<pre class="language-html" data-title="my-app.html" data-overflow="wrap"><code class="lang-html">&#x3C;import from="./fourohfour-page">&#x3C;/import>

&#x3C;div>
  &#x3C;h1>Recipes&#x3C;/h1>

  &#x3C;nav>
    &#x3C;a load="/">Home&#x3C;/a>&#x26;nbsp;&#x26;nbsp;&#x26;nbsp;&#x26;nbsp;
    &#x3C;a load="/recipes">Recipes&#x3C;/a>
  &#x3C;/nav>
<strong>  &#x3C;au-viewport fallback="fourohfour-page">&#x3C;/au-viewport>
</strong>&#x3C;/div
</code></pre>

## Reading route parameters

When we created our routes in `my-app.ts` you might recall we created a recipe detail route which had a `recipeId` parameter. Now, we are going to modify our `recipe-detail` component to read this value from the URL and load the content.

{% code title="recipe-detail.ts" overflow="wrap" %}
```typescript
import { HttpClient } from '@aurelia/fetch-client';
import { IRouter } from '@aurelia/router';

export class RecipeDetail {
  private http: HttpClient = new HttpClient();
  private recipe;

  constructor(@IRouter readonly router: IRouter) {}

  async canLoad(parameters) {
    if (parameters?.recipeId) {
      const loadRecipe = await this.loadRecipe(parameters.recipeId);

      if (loadRecipe) {
        this.recipe = loadRecipe;
        
        return true;
      } else {
        this.router.load(`/recipes`);
      }
    }
  }

  async loadRecipe(recipeId) {
    const request = await this.http.fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
    );
    const response = await request.json();

    return response.meals ? response.meals[0] : false;
  }
}
```
{% endcode %}

There is a little more to unpack here. We inject the router because we will programmatically redirect away if the user attempts to view a non-existent recipe ID. We use the `canLoad` method because loading our recipe view relies on existing recipes. If the recipe can't be found using the API, we redirect to the recipes page programmatically using the `router.load` method.

Inside `recipe-detail.html` we'll render our recipe:

{% code title="recipe-detail.html" overflow="wrap" %}
```html
<h1>${recipe.strMeal}</h1>
<img src.bind="recipe.strMealThumb" />
<p textcontent.bind="recipe.strInstructions"></p>
```
{% endcode %}

The API we are using returns ingredients on a line-by-line basis,. so we've omitted those from this example. Now, you should be able to run your application and click on recipes to view them. A headline, image and instructions should now be visible.

As an additional step, you could add those in yourself.

## Styling active links

The router automatically adds a `active` class to all route links when they are active. Because our routes all live in `my-app` We will edit `my-app.css` , and we don't even have to import it (Aurelia does that automatically for us).

{% code title="my-app.css" %}
```css
.active {
  font-weight: bold;
}

a {
  color: #000;
  text-decoration: none;
}
```
{% endcode %}

The `active` class is now bold when active. We also do some quick styling tweaks to the route links to remove the underline and make them black so we can see the bold stand out more.

## That's it

You just built a recipe application. It doesn't allow you to create recipes, and it's not very pretty, but it works. To see the application in action, a working demo of the above code [can be seen here](https://stackblitz.com/edit/au2-conventions-n56ej9) (or below).

{% embed url="https://stackblitz.com/edit/au2-conventions-n56ej9?embed=1&file=package.json&hideExplorer=1&view=preview" %}
