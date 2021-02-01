---
description: >-
  Learn to use Aurelia's project scaffold tooling to create your first project
  setup.
---

# Creating Your First App

There are various ways that you can set up an Aurelia project, including everything from adding a simple script tag to your HTML page to creating a custom [Webpack](https://github.com/aurelia/aurelia/tree/master/packages/webpack-loader) configuration. One of the easiest and most powerful ways to get started is by using [the `makes` tool.](https://github.com/aurelia/new)

Before you run `makes`, you will need a recent version of Node.js installed on your machine. If you do not have Node.js, you can [get it here.](https://nodejs.org/en/) Please ensure that Node.js is up-to-date.

Next, using [`npx`](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b), a tool distributed with Node.js, we'll create a new Aurelia app. Open a command prompt and run the following command:

{% code title="" %}
```bash
npx makes aurelia
```
{% endcode %}

`makes` will then start the Aurelia project wizard, asking you a few questions to help you get things set up properly. When prompted, give your project the name "hello-world" and then select a default setup, either ESNext or TypeScript, depending on your preference. Finally, choose "yes" to install the project dependencies.

You have now created a hello world app without writing a single line code, well done. However, we'll be updating our app to allow for text input so we can make it say, "Hello" to whoever we want in the next section.

You now have an Aurelia setup ready for you to run, debug, or deploy. To ensure that everything is working properly, `cd` into your project folder and run `npm start`. Your project will then build and a web browser will open, displaying the message "Hello World".

Congratulations! 🎊 You just ran your first Aurelia app. Next, let's explore the code a bit.

