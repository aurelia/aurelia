---
description: Use a declarative approach to describe how your component should be rendered.
---

# Your First Component - Part 2: The View

In the previous section, we created a basic view-model, and you are probably sceptical that we are now going to create a view with a text input that updates this value without writing any more Javascript.

Inside the `src` directory create a new file called `hello-name.html` this will complicate the view-model you already have \(`hello-name.ts` or `hello-name.js`\).

Firstly, let's write the code to display the value. Notice how we are using interpolation to print the value like the default generated `my-app.html` file was? `${name}` the value inside the curly braces references the class property we defined in the previous section, by the name of `name`.

```text
<div>
    <h4>Hello, ${name}!</h4>
</div>
```

I would say run the app and see it in action, but we haven't imported our custom element just yet. Let's do that now.

Inside of `my-app.html` replace the entire file with the following:

```text
<import from="./hello-name"></import>

<hello-name></hello-name>
```

We use the `import` element to include our newly created component. Take note there is a lack of file extension. This is because Aurelia will know to include our view-model and, in turn, include our view and any styles.

We then reference our custom element by its name. Aurelia knows using default conventions to take the file name, strip the file extension and use that as the tag name \(this is configurable but beyond the scope of this tutorial\).

If you were to run the app using `npm start` you would then see your application rendering your new component. You should see the text, `Hello, Person!` rendering in the view. Once you have the app running, leave it running as any changes you make will automatically be detected and re-rendered.

### Binding the name to a text input

We have a functional custom element, but we promised we would be able to update the name with any value we want. Inside of `hello-name.html` add the following beneath the existing heading. 

```text
<div>
    <h4>Hello, ${name}!</h4>
    
    <p><input type="text" value.bind="name"></p>
</div>
```

You should now see a text input with the value `Person` inside of it. By adding `value.bind` to the input, Aurelia will use two-way binding by default. This means it will show the value from the view-model inside of the view, and if it changes in either view or view-model, it will be updated. Think of a two-way binding as syncing the value.

Type something into the text input and you should see the heading value change as you type. This works because Aurelia binds to the native `value` property of the text input and keeps track of the changes for you without needing to use callbacks or anything else.

As you might have noticed, there really is not that much code here. Leveraging Aurelia's conventions and defaults allows you to write Aurelia applications without the verbosity and without writing tens of lines of code to do things like binding or printing values.

