[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/metadata.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/metadata)
# @aurelia/state

## Installing

For the latest stable version:

```bash
npm i @aurelia/state
```

For our nightly builds:

```bash
npm i @aurelia/state@dev
```

## Multiple Stores

Register additional stores by providing a `storeName` or `storeKey` when initializing the configuration:

```ts
import { StateDefaultConfiguration } from '@aurelia/state';

Aurelia.register(
  StateDefaultConfiguration.init({ counter: 0 }), // default store
  StateDefaultConfiguration.init({ users: [] }, { storeName: 'users' }),
);
```

In templates, target a specific store with the `& state:'name'`:

```html
<div textcontent.state="users.length & state:'users'"></div>
<button click.dispatch="{ type: 'reload' } & state:'users'">Refresh Users</button>
```

Other integrations understand named stores as well:

```ts
import { fromState } from '@aurelia/state';

class UserPanel {
  @fromState('users', state => state.users)
  users!: User[];
}
```

Binding behavior accepts an argument for the store identifier:

```html
<span textcontent.bind="name & state:'users'"></span>
```
