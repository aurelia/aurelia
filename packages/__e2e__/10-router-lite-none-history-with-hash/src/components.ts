import { route } from '@aurelia/router-lite';
import { customElement } from 'aurelia';

@customElement({ name: 'ce-one', template: `ce-one` })
class  CeOne {}

@customElement({ name: 'ce-two', template: `ce-two` })
class  CeTwo {}

@route({
  title: 'Router-Lite',
  routes: [
    {
      path: ['', 'c1'],
      component: CeOne,
      title: 'C1',
    },
    {
      path: 'c2',
      component: CeTwo,
      title: 'C2',
    },
  ],
})
@customElement({ name: 'my-app', template: `
<nav>
  <a load="c1">C1</a>
  <a load="c2">C2</a>
</nav>

<au-viewport></au-viewport>` })
export class MyApp {

}
