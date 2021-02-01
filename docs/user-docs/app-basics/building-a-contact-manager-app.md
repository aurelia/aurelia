# Building a Contact Manager App

Congratulations, you are about to create your first Aurelia 2 application. Before we get started, there are only a couple of prerequisites you need to fulfil.

## Setting Up Your Machine

You'll need a computer \(obviously\) as well as Node.js and Npm installed.

To install Node.js, you can obtain an installer for all major operating systems [here](https://nodejs.org/en/download/) and follow the installation instructions. Downloading the LTS version of Node is recommended as the latest version can contain bugs and be incompatible.

Ideally, you will also want a code editor. There are a few free ones around, but we highly recommend Microsoft's Visual Studio Code editor, which is not only free but has a lot of community support in the form of plugins and theme.

You can find a download for Visual Studio Code [here](https://code.visualstudio.com/).

## What You Will Be Learning

The idea behind building this contact manager is you will learn Aurelia fundamentals that will apply to mostly all Aurelia applications you find yourself working on.

* How to create a new Aurelia application from scratch
* How to break your UI into components
* Working with user entered data
* How to leverage routing
* How to work with multiple viewports in the router to create dynamically sectioned views
* How to utilize Aurelia's templating syntax to work with collections of data, bind to events and more

## Creating A New Aurelia Project

Now, we get to the fun stuff. To create a new Aurelia project, we do not need to download anything, and we do not need to install any packages or CLI's either.

By running `npx makes aurelia` in your command line of choice, the Aurelia CLI will automatically obtain the latest version of Aurelia and settings to present you. You will be presented three options initially when you run makes, for the purposes of this tutorial we will choose option 2, "Default TypeScript Aurelia 2 App" which will create a TypeScript starter app for us.

Once the creation process has finished, you will be presented with instructions on how to run your newly created app. Make sure you run the app to ensure that everything was setup correctly, before you proceed with the creation of our application.

## Creating The Initial Structure

We now have a barebones Aurelia application. Let's tweak some of the markup to support the structure of our contact manager application.

```markup
<nav class="navbar navbar-light bg-light border-bottom" role="navigation">
    <a class="navbar-brand" href="#">
        <i class="fa fa-user"></i>
        <span>Contacts</span>
    </a>
</nav>

<div class="container mt-3">

    <div class="row">
        <aside class="col-md-4">
            <p>Placeholder text for contacts</p>
        </aside>

        <main class="col-md-8">
            <p>Main content goes here!</p>
        </main>
    </div>

</div>
```

## Configure Routing

Our contact manager application is going to make use of Aurelia's router for rendering contact details. For this, we will have to make sure the router instance is registered with Aurelia during bootstrap.

**Replace your `src/main.ts` file with the following:**

The changes we are making are not too dramatic or different. We are introducing the `register` method and passing in the `RouterConfiguration` instance to tell Aurelia we want to enable routing. This will enable the router application wide.

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration)
  .app(MyApp)
  .start();
```

We then have to add a viewport into our `my-app.html` file which is the root of our application. This is where our contact details and whatnot will be rendered. Let's replace the placeholder text with the `<au-viewport>` element where contacts will be rendered.

```markup
<div class="container">

    <div class="row">
        <aside class="col-md-4">
            <p>Placeholder text for contacts</p>
        </aside>

        <main class="col-md-8">
            <au-viewport name="main" default="no-selection"></au-viewport>
        </main>
    </div>

</div>
```

## Creating The Default Component

We will need a component that is displayed when the app is first loaded and no contact has been selected. For this, we will be using the `default` property on the `<au-viewport>` element which will tell it to render this component unless we say otherwise.

As you can see, we already have this from the previous sections of this tutorial.

**Create a new folder called `components` inside of the `src` directory and create a file called `no-selection.html`**

```markup
<div class="text-center">
    <h1>No contact selected</h1>
</div>
```

**Now, let's update our `my-app.html` file and import the `no-selection` component**

```markup
<import from="./components/no-selection.html"></import>

<div class="container mt-3">

    <div class="row">
        <aside class="col-md-4">
            <p>Placeholder text for contacts</p>
        </aside>

        <main class="col-md-8">
            <au-viewport name="main" default="no-selection"></au-viewport>
        </main>
    </div>

</div>
```

If you were to run your application right now, you should see your `no-selection` component rendered because we haven't specified any other route should be displayed. Our application is also a broken mess, we have no styling or anything just yet.

## Installing Bootstrap

For the purposes of this tutorial, we are going to be using Bootstrap for our CSS styling, primarily for its excellent grid system which will save us a lot of time. In a command line, run the following command to download and install Bootstrap into your application `package.json` file.

```text
npm install bootstrap
```

**At the top of `my-app.ts` let's import Bootstrap**

```typescript
import 'bootstrap/dist/css/bootstrap.css';
```

At this point, if you have the app running, the styling should now be working and less unstyled.

