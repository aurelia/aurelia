import { customElement } from '@aurelia/runtime-html';
import { RouterStartEvent, RouterStopEvent, RouterNavigationStartEvent, RouterNavigationEndEvent, RouterNavigationCancelEvent, RouterNavigationCompleteEvent, RouterNavigationErrorEvent, RouterConfiguration, IRouter, } from '@aurelia/router';
import { IDisposable, IEventAggregator, resolve } from '@aurelia/kernel';

import { Slow } from './slow';
import { Fast } from './fast';
import { FastParent } from './fast-parent';
import { DoubleSlow } from './double-slow';
import { SlowAttachParent } from './slow-attach-parent';
import { LazyParent } from './lazy-parent';
import { Dashboard } from './dashboard';

import { Philosophers } from './philosophers';

@customElement({
  name: 'my-app',
  dependencies: [Slow, Fast, FastParent, DoubleSlow, SlowAttachParent, LazyParent, Dashboard, Philosophers],
  template: `
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    margin: 10px;
  }
  div {
    padding: 10px;
  }
  div.viewports,
  div.links {
    display: flex;
  }
  div.links {
    padding: 15px;
  }
  div.viewport {
    display: inline-block;
    width: 45%;
    background-color: lightgray;
  }
  au-viewport {
    display: grid;
    margin-top: 10px;
    padding: 10px;
    border: 1px solid darkgray;
    position: relative;
    overflow: hidden;
  }
  au-viewport.viewport-active {
    min-height: 1.6em;
  }
  au-viewport.viewport-active::before {
    content: ' ';
    position: absolute;
    top: 0.1em;
    right: 0.1em;
    /*
    left: 0px;
    top: 0px;
    display: inline-block;
    width: 100%;
    height: 100%;
    background-color: lightblue;
    text-align: center;
    opacity: 0.4;
    */
    border: 0.1em solid #f3f3f3; /* Light grey */
    border-top: 0.1em solid #3498db; /* Blue */
    border-radius: 50%;
    width: 1em;
    height: 1em;
    opacity: 0;
    animation: spin 2s linear 500ms infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); opacity: 1; }
    100% { transform: rotate(360deg); opacity: 1; }
  }
  au-viewport > * {
    display: block;
    position: relative;
    grid-column: 1;
    grid-row: 1;
  }
  a {
    display: inline-block;
    flex-grow: 1;
    margin: 2px;
    border: 1px solid gray;
  }
  a.clear {
    float: right;
    border: 1px solid black;
    flex-grow: 0;
  }
  a.load-active {
    color: darkorange;
  }
</style>
<h4>Location: \${url}</h4>
<div class="viewports">
  <div class="viewport">
    <div class="links">
      <a load="fast@left">Fast</a>
      <a load="slow@left">Slow</a>
      <a load="double-slow@left">DoubleSlow</a>
      <a load="fast-parent@left">FastParent</a>
      <a load="-@left" class="clear">X</a>
    </div>
    <au-viewport name="left"></au-viewport>
  </div>
  <div class="viewport">
    <div class="links">
      <a load="fast@right">Fast</a>
      <a load="slow@right">Slow</a>
      <a load="double-slow@right">DoubleSlow</a>
      <a load="fast-parent@right">FastParent</a>
      <a load="-@right" class="clear">X</a>
    </div>
    <au-viewport name="right"></au-viewport>
  </div>
</div>
<!--
<br>
<a load="dashboard@left">Dashboard</a>
<h3 class="message">\${message}</h3>
<au-compose subject.bind="root"></au-compose>
<div>
  <input type="checkbox" checked.bind="sync"> Sync swaps
</div>
<div class="links">
<a href="javascript: void 0" click.trigger="sequence()">Sequence</a>
<a load="fast(abc)@left?str=def&arr=ghi&arr=jkl">fast(abc)@left?str=def&arr=ghi&arr=jkl</a>
  <a href="javascript: void 0" click.trigger="fast()">Load fast(def)@left?str=ghi&arr=jkl&arr=mno</a>
  <br>
  <a load="lazy-parent@left">LazyParent</a>
  <a load="philosophers@left">Philosophers</a>
  <a load="fast@left+slow@right">Fast + Slow</a>
  <a load="slow@left+fast@right">Slow + Fast</a>
  <a load="fast@left+double-slow@right">Fast + DoubleSlow</a>
  <a load="fast-parent@left/slow+slow@right">FastParent/Slow + Slow</a>
  <a load="fast-parent@left/slow+double-slow@right">FastParent/Slow + DoubleSlow</a>
  <a load="fast-parent@left/slow">FastParent/Slow</a>
  <a load="langsam">Långsam</a>
  <a load="fast-parent@left/langsam">FastParent/Långsam</a>
  <a load="slow-attach-parent@left">SlowAttachParent</a>
  <a load="slow-attach-parent@left/double-slow">SlowAttachParent/DoubleSlow</a>
  <a load="-">Clear</a>
</div>
-->
  `,
})
export class MyApp {
  public static routes = [
    { path: 'langsam', component: 'slow', viewport: 'left', title: 'Långsam' },
  ];

  public message = 'Swaps: asap vs synced';

  public url = '';
  public synced: boolean = this.sync;

  public root = Fast;

  private readonly subscriptions: IDisposable[] = [];
  private readonly em = resolve(IEventAggregator);
  private readonly router = resolve(IRouter);
  private readonly config = resolve(RouterConfiguration);

  public constructor(
  ) {
    this.config.addHook((...args) => {
      console.log('Hook', args);
      return true;
    });
  }

  public binding(): void {
    this.subscriptions.push(
      ...[
        RouterStartEvent.eventName,
        RouterStopEvent.eventName,
        RouterNavigationStartEvent.eventName,
        RouterNavigationEndEvent.eventName,
        RouterNavigationCancelEvent.eventName,
        RouterNavigationCompleteEvent.eventName,
        RouterNavigationErrorEvent.eventName,
      ].map(eventName =>
        // this.subscriptions.push(this.em.subscribe(eventName, this.eventHandler));
        this.em.subscribe(eventName, this.eventHandler)
      ),
      this.em.subscribe(RouterNavigationStartEvent.eventName, (event: RouterNavigationStartEvent) => { console.log('event', event.eventName); }),
    );
  }
  public unbinding(): void {
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }
    this.subscriptions.length = 0;
  }

  public get sync(): boolean {
    return this.config.options.navigationSyncStates.includes('bound');
  }
  public set sync(value: boolean) {
    if (this.sync !== value) {
      if (value) {
        this.root = Slow;
        this.config.options.navigationSyncStates.push('bound');
      } else {
        this.root = Fast;
        this.config.options.navigationSyncStates.splice(this.config.options.navigationSyncStates.indexOf('bound'), 1);
      }
    }
  }

  public fast() {
    // this.router.load("fast(abc)@left", { parameters: 'str=def&arr=ghi&arr=jkl' });
    void this.router.load("fast(def)@left", { parameters: { str: 'ghi', arr: ['jkl', 'åäö'] } });
  }

  public async sequence() {
    void this.router.load('double-slow@left');
    await new Promise(res => setTimeout(res, 1000));
    void this.router.load('fast@right');
    await new Promise(res => setTimeout(res, 1000));
    void this.router.load('fast-parent@right');
    await new Promise(res => setTimeout(res, 1000));
    void this.router.load('fast@right');
  }

  private readonly eventHandler = (event: RouterNavigationStartEvent) => {
    // console.log(event.eventName, event);
    if (event instanceof RouterNavigationEndEvent) {
      const navigation = event.navigation;
      this.url = `${navigation.path} (${Object.keys(navigation.navigation).filter(key => navigation.navigation[key]).join(',')})`;
    }
  };
}
