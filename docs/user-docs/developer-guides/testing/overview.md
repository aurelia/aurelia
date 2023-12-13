# Testing

Testing is an integral part of modern development, and Aurelia supports testing through helper methods and ways of instantiating the framework in a test environment. Aurelia supports numerous test runners, including Jest and Mocha, and the guiding test principles are the same.

When it comes to testing, Aurelia provides a testing package `@aurelia/testing` comes with some helpers functions, including a fixture creation method that allows you to instantiate components and handle setup and teardown.

When you test components and other view resources in Aurelia, you will write integration tests and query the DOM for changes to content. Not quite a unit test because we are testing behaviors of our code in the view. However, writing both integration and unit tests is highly recommended.

## Unit vs integration vs e2e tests

If you are new to testing or inexperienced, it is worth noting that when dealing with tests in Aurelia, they are broken down into three distinct categories.

* **Unit tests** — Testing units of your code independently (if statements, function calls, throws, etc.). Most commonly, a unit test involves testing the code itself.
* **Integration tests** — An integration test is an evolutionary leap on unit tests. Instead of testing lines of code in isolation, you test them as a whole. In Aurelia, an integration test commonly refers to staging a resource (component, attribute, value converter) and testing it for the desired UI outcome.
* **End-to-end tests (E2E)** — An e2e test allows you to test behavior in the browser. Think of test cases involving logging into your application and being redirected to a dashboard screen, a button triggering a popup. These are things you would test for in an e2e test.

In the Aurelia documentation, we will not be covering e2e tests as those are outside the realm of the framework itself. Although, we do highly recommend Playwright for end-to-end testing.
