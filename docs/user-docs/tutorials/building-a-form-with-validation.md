# Building a form with validation

{% hint style="danger" %}
This tutorial is a work in progress and not yet complete.
{% endhint %}

This tutorial will show you how to create dynamic forms in Aurelia, utilizing data binding and validation to validate data.

## Objectives

This tutorial will which you how to do the following:

* How to build forms, leveraging components and templating syntax
* Using `value.bind` on form inputs to utilize two-way data binding
* Provide feedback to the user when user input is invalid
* How to disable form input controls

## Prerequisites

Before proceeding, please make sure you have a grasp of the following concepts:

* How to set up an Aurelia application. You can learn how to get up and running quickly [here](../getting-started/quick-install-guide.md).
* A basic understanding of [Aurelia templating syntax](../getting-to-know-aurelia/introduction/).

## Build the form

The form we are going to be building is a product creation page for an imaginary online store that sells fruit. We will have fields for the product name, the product category as well as some other important pieces of information required for our store.

### Step 1

Create a new file called `new-product.ts` and place it into the `src` directory.

```text
export class NewProduct {
    private formSubmitted = false;
}
```

