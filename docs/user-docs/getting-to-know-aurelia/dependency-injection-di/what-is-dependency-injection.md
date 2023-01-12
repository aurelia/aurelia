---
description: >-
  Learn about why Dependency Injection (DI) is so important and what role it
  plays in Aurelia.
---

# What is Dependency Injection?

## What is DI, and why would I use it?

As a system increases in complexity, it becomes more and more important to break complex code down into groups of smaller, collaborating functions or objects. However, once we’ve broken down a problem/solution into smaller pieces, we have introduced a new problem: how do we put the pieces together?

One approach is to have the controlling function or object directly instantiate all its dependencies. This is tedious but also introduces the bigger problem of tight coupling and muddies the controller's primary responsibility by forcing upon it a secondary concern of locating and creating all dependencies. Inversion of Control (IoC) can be employed to address these issues.&#x20;

Simply put, the responsibility for locating and/or instantiating collaborators is removed from the controlling function/object and delegated to a 3rd party (the control is inverted).&#x20;

Typically, this means that all dependencies become parameters of the function or object constructor, making every function/object implemented this way not only decoupled but open for extension by providing different implementations of the dependencies. The process of providing these dependencies to the controller is known as Dependency Injection (DI).

Once again, we’re back at our original problem: how do we put all these pieces together? With the control merely inverted and open for injection, we are now stuck having to manually instantiate or locate all dependencies and supply them before calling the function or creating the object…and we must do this at every function call site or every place that the object is instanced. It seems as if this may be a bigger maintenance problem than we started with!

Fortunately, there is a battle-tested solution to this problem. We can use a Dependency Injection Container. With a DI container, a class can declare its dependencies and allow the container to locate them and provide them to the class. Because the container can locate and provide dependencies, it can also manage the lifetime of objects, enabling singleton, transient and object pooling patterns without consumers needing to be aware of this complexity.
