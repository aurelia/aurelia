# Looping with Repeat.for

Aurelia provides a `repeat.for` attribute that allows you to loop over data inside of your views. Think of `repeat.for` as the equivalent of a traditional for loop in Javascript. Common scenarios might include loop over an array of products for an online store or options for a select dropdown.

You will find numerous working code examples below showcasing how you can work with collections of data in Aurelia.

### Looping over an array of strings

In the following example, we loop over an array inside of our view model called `items` and display the values in an unordered list. Notice how we use `repeat.for` on our list item? This tells Aurelia that for every value it finds, populate `item` with its value.

This type of functionality is convenient for situations where you want to display simple string values or populate select dropdowns where you only need the display value.

{% embed url="https://stackblitz.com/edit/aurelia-repeat-array-of-strings?embed=1&file=my-app.html" %}

### Looping over an array of objects

More commonly when working with an array of data, you will be working with an array of objects. You still loop over the array like we did in the previous example, however, we treat the populated `item` variable as an object, referencing the property names in view.

{% embed url="https://stackblitz.com/edit/aurelia-repeat-array-of-strings-sxz6uq?embed=1&file=my-app.html" %}

### Looping with numeric ranges

Sometimes you might want to display a list of values in successive order, a range of numbers of 1 to 10. The repeater allows you to do this with ease. In the following example, there is nothing defined inside of the view model, just the view. All we did was write `repeat.for="i of 10"` and then displayed the value, counting it down with each iteration.

{% embed url="https://stackblitz.com/edit/aurelia-repeat-range?embed=1&file=my-app.html" %}



