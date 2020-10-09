import { customElement } from '@aurelia/runtime';

import * as routes from './routes/index';
import * as template from './my-app.html';

@customElement({ name: 'my-app', template, dependencies: [routes] })
export class MyApp { }
