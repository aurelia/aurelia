---
description: >-
  New to Javascript, Node.js and front-end development in general? Don't worry,
  we got you.
---

# Aurelia for new developers

Welcome to the magical world of Javascript development. This guide is for any newcomer to front-end development who isn't that experienced with modern tooling or Javascript frameworks.

## Getting started

For the purposes of this tutorial and as a general rule for any modern framework like Aurelia, you will be using a terminal of some sort. On Windows, this can be the Command Prompt or Powershell. On macOS, it'll be Terminal \(or any other Terminal alternative\), the same thing with Linux.

To work with Aurelia, you will need to install Node.js. If you are new to Node.js, it is used by almost every tool in the front-end ecosystem now, from Webpack to other niche bundlers and tools. It underpins the front-end ecosystem.

The easiest way to install Node.js is from the official website [here](https://nodejs.org/en/). Download the installer for your operating system and then follow the prompts.

## Download a code editor

To write code, you need an editor that will help you. The most popular choice for Javascript development is [Visual Studio Code](https://code.visualstudio.com/). It is a completely free and open-source code editor made by Microsoft, which has great support for Aurelia applications and Node.js.

## Create a new Aurelia project

We will be following the instructions in the [Quick install guide](quick-install-guide.md) to bootstrap a new Aurelia application. After installing Node.js, that's it. You don't need to install anything else to create a new Aurelia application, here's how we do it.

Open up a Terminal/Command Prompt window and run the following:

```bash
npx makes aurelia
```

You are going to be presented with a few options when you run this command. Don't worry, we'll go through each screen step by step.

### Step 1. Name your project

You will be asked to enter a name for your project, this can be anything you want. If you can't think of a name just enter `my-app` and then hit enter.

### Step 2. Choose your options

In step 2 you will be presented with three options. 

* Option one: "Default ESNext Aurelia 2 App" this is a basic Aurelia 2 Javascript application using Babel for transpiling and Webpack for the bundler. 
* Option two: "Default Typescript Aurelia 2 App" this is a basic Aurelia 2 TypeScript application with Webpack for the bundler.
* Option three: "Custom Aurelia 2 App" no defaults, you choose everything.

In this guide, we are going to go with the most straightforward option, option \#1.

### Step 3. Install the dependencies

You are going to be asked if you want to install the Npm dependencies and the answer is yes. For this guide we are using Npm, so select option \#2.

Depending on your internet connection speed, this can take a while.

### Step 4. Run the sample app

After the installation is finished you should see a little block of text with the heading, "Get Started" follow the instructions. Firstly, `cd my-app` to go into the directory where we installed our app. Then run `npm start` to run our example app.

Your web browser should open automatically and point to http://localhost:9000

Any changes you make to the files in the `src` directory of your app will cause the dev server to refresh the page with your new changes. Edit `my-app.html` and save it to see the browser update. Cool!

## Building your app

In the last section we created a new application and ran the development server, but in the "real world" you will build and deploy your site for production.

Run the Npm build command by running the following in your Terminal or Command Prompt window:

```text
npm run build
```

This will build your application for production and create a new folder called `dist`.

