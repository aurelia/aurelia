<p>
  <a href="https://aurelia.io/" target="_blank">
    <img alt="Aurelia" src="https://aurelia.io/styles/images/aurelia.svg">
  </a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40aurelia%2Fkernel.svg)](https://badge.fury.io/js/%40aurelia%2Fkernel)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Twitter](https://img.shields.io/twitter/follow/aureliaeffect.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=aureliaeffect)

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![Maintainability](https://api.codeclimate.com/v1/badges/5ac0e13689735698073a/maintainability)](https://codeclimate.com/github/aurelia/aurelia/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5ac0e13689735698073a/test_coverage)](https://codeclimate.com/github/aurelia/aurelia/test_coverage)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![Backers on Open Collective](https://opencollective.com/aurelia/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/aurelia/sponsors/badge.svg)](#sponsors)

# Aurelia 2

This is the Aurelia 2 monorepo, containing core and plugin packages, examples, benchmarks, and documentation for the upcoming major version of everybody's favorite modern JavaScript framework, [Aurelia](http://www.aurelia.io/).

## Introduction

Aurelia is a modern, front-end JavaScript framework for building browser, mobile, and desktop applications. It focuses on aligning closely with web platform specifications, using convention over configuration, and having minimal framework intrusion. Basically, we want you to just write your code without the framework getting in your way. :wink:

Aurelia applications are built by composing a series of simple components. By convention, components are made up of a vanilla JavaScript or Typescript class, with a corresponding HTML template.

```js
//app.js
export class App {
  welcome = "Welcome to Aurelia";

  quests = [
    "To seek the holy grail",
    "To take the ring to Mordor",
    "To rescue princess Leia"
  ];
}
```

```html
<!-- app.html -->
<form>
  <label for="name-field">What is your name?</label>
  <input id="name-field" value.bind="name & debounce:500">

  <label for="quest-field">What is your quest?</label>
  <select id="quest-field" value.bind="quest">
    <option></option>
    <option repeat.for="q of quests">${q}</option>
  </select>
</form>

<p if.bind="name">${welcome}, ${name}!</p>
<p if.bind="quest">Now set forth ${quest.toLowerCase()}!</p>
```

This example shows you some of the powerful features of the aurelia binding syntax. To learn further, please [see our documentation](https://docs.aurelia.io/).

Feeling excited? Check out how to use `makes` to get started in the next section.

Note: *Please keep in mind that Aurelia 2 is still in pre-alpha.* A number of features and use cases around the public API are still untested and there will be a few more breaking changes.

## Getting Started

To get started with a new Aurelia 2 project, with Node.js installed, simply run `npx makes aurelia`. You'll then be guided through a series of choices on how you'd like to setup your project. Once complete, you'll have a new Aurelia 2 project ready to run. For more information on Aurelia's use of `makes`, see [here](https://github.com/aurelia/new). If you aren't interested in taking our preferred approach to generating a project, you can also see [the examples folder in this repo](examples) for pure JIT setups (no conventions) with various loaders and bundlers.

## Documentation

You can read the documentation on Aurelia 2 [here](https://docs.aurelia.io/). Our new docs are currently a work-in-progress, so the most complete documentation is available in our getting started section. If you've never used Aurelia before, you'll want to begin with our [Quick Start Guide](https://docs.aurelia.io/getting-started/quick-start-guide).

## Contributing

If you are interested in contributing to Aurelia, please see [our contributor documentation](https://docs.aurelia.io/community-contribution/joining-the-community) for more information. You'll learn how to build the code and run tests, how best to engage in our social channels, how to submit PRs, and even how to contribute to our documentation. We welcome you and thank you in advance for joining with us in this endeavor.

## Staying Up-to-Date

To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.aurelia.io/) and [our email list](http://eepurl.com/ces50j). We also invite you to [follow us on twitter](https://twitter.com/aureliaeffect). If you have questions, have a look around our [Discourse forum](https://discourse.aurelia.io/). For chat on Aurelia 2, [join our new Aurelia 2 community on Discord](https://discordapp.com/channels/448698263508615178/448698263508615180). If you'd like to join the growing list of Aurelia sponsors, please [back us on Open Collective](https://opencollective.com/aurelia).

## License

Aurelia is MIT licensed. You can find out more and read the license document [here](LICENSE).

---

Cross-browser testing provided by:

<a href="http://browserstack.com"><img height="70" src="docs/images/browserstack-logo.png" alt="BrowserStack"></a>
