import { expect } from 'chai';
import { spy } from 'sinon';
import { Aurelia, CustomElementResource, LifecycleFlags as LF, LifecycleTask, ProxyObserver, IDOM } from '../src/index';
import { AuDOM, AuDOMConfiguration, AuNode, AuDOMTest } from './au-dom';

describe('Aurelia', function () {
  let sut: Aurelia<AuNode>;
  let dom: AuDOM;
  let host: AuNode;

  beforeEach(function () {
    sut = new Aurelia(AuDOMConfiguration.createContainer());
    dom = sut.container.get<AuDOM>(IDOM);
    host = dom.createElement('app');
  });

  describe('constructor', function () {
    it('should initialize container directly', function () {
      expect(sut.container.get(Aurelia), `sut.container.get(Aurelia)`).to.equal(sut);
    });

    it('should initialize correctly', function () {
      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.container).not.to.equal(undefined);
      expect(sut['startFlags'], `sut['startFlags']`).to.equal(LF.none);
      expect(sut['stopFlags'], `sut['stopFlags']`).to.equal(LF.none);
      expect(sut.host, `sut.host`).to.equal(null);
      expect(sut['next'], `sut['next']`).to.equal(null);
      expect(sut['task'], `sut['task']`).to.equal(LifecycleTask.done);
      expect(sut['_root'], `sut['_root']`).to.equal(null);
    });
  });

  describe('wait()', function () {
    it('always returns a promise', function () {
      expect(sut.wait(), `sut.wait()`).to.be.instanceof(Promise);
    });
  });

  describe('register()', function () {
    it('should register dependencies', function () {
      spy(sut.container, 'register');
      class Foo {}
      class Bar {}
      sut.register(Foo as any, Bar as any);

      expect(sut.container.register, `sut.container.register`).to.have.been.calledWith(Foo, Bar);
    });

    it('should register dependencies as array', function () {
      spy(sut.container, 'register');
      class Foo {}
      class Bar {}
      sut.register([Foo, Bar] as any);

      expect(sut.container.register, `sut.container.register`).to.have.been.calledWith([Foo, Bar]);
    });
  });

  describe('app()', function () {
    it('should initialize correctly with a valid component type', function () {
      const config = {
        component: CustomElementResource.define({ name: 'app', template: '' }),
        host
      };
      sut.app(config);

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.container).not.to.equal(undefined);
      expect(sut.host, `sut.host`).to.equal(config.host);
      expect(sut['startFlags'], `sut['startFlags']`).to.equal(LF.fromStartTask);
      expect(sut['stopFlags'], `sut['stopFlags']`).to.equal(LF.fromStopTask);
      expect(sut['next'], `sut['next']`).to.be.instanceof(config.component);
      expect(sut['task'], `sut['task']`).to.equal(LifecycleTask.done);
      expect(sut['_root'], `sut['_root']`).to.equal(null);
    });

    it('should initialize correctly with a valid component instance', function () {
      const config = {
        component: new (CustomElementResource.define({ name: 'app', template: '' }))(),
        host
      };
      sut.app(config);

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.container).not.to.equal(undefined);
      expect(sut.host, `sut.host`).to.equal(config.host);
      expect(sut['startFlags'], `sut['startFlags']`).to.equal(LF.fromStartTask);
      expect(sut['stopFlags'], `sut['stopFlags']`).to.equal(LF.fromStopTask);
      expect(sut['next'], `sut['next']`).to.equal(config.component);
      expect(sut['task'], `sut['task']`).to.equal(LifecycleTask.done);
      expect(sut['_root'], `sut['_root']`).to.equal(null);
    });

    it('should switch correctly on second call', function () {
      const config1 = {
        component: CustomElementResource.define({ name: 'app1', template: '' }),
        host
      };
      const config2 = {
        component: CustomElementResource.define({ name: 'app2', template: '' }),
        host
      };
      sut.app(config1);
      sut.app(config2);

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.container).not.to.equal(undefined);
      expect(sut.host, `sut.host`).to.equal(config2.host);
      expect(sut['startFlags'], `sut['startFlags']`).to.equal(LF.fromStartTask);
      expect(sut['stopFlags'], `sut['stopFlags']`).to.equal(LF.fromStopTask);
      expect(sut['next'], `sut['next']`).to.be.instanceof(config2.component);
      expect(sut['task'], `sut['task']`).to.equal(LifecycleTask.done);
      expect(sut['_root'], `sut['_root']`).to.equal(null);
    });

    it('should initialize with the raw value if component is a proxy', function () {
      const config = {
        component: new (CustomElementResource.define({ name: 'app', template: '' }))(),
        host
      };
      const proxy = ProxyObserver.getOrCreate(config.component).proxy;
      config.component = proxy;

      sut.app(config);

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.container).not.to.equal(undefined);
      expect(sut.host, `sut.host`).to.equal(config.host);
      expect(sut['startFlags'], `sut['startFlags']`).to.equal(LF.fromStartTask);
      expect(sut['stopFlags'], `sut['stopFlags']`).to.equal(LF.fromStopTask);
      expect(sut['next'], `sut['next']`).to.equal(config.component.$raw);
      expect(sut['task'], `sut['task']`).to.equal(LifecycleTask.done);
      expect(sut['_root'], `sut['_root']`).to.equal(null);
    });

    it('should throw if given a null component', function () {
      const config = {
        component: null,
        host
      };

      expect(() => {
        sut.app(config);
      }).to.throw('A valid component must be provided, but received: null');
    });

    it('should throw if given no component', function () {
      const config = {
        host
      };

      expect(() => {
        sut.app(config as any);
      }).to.throw('A valid component must be provided, but received: undefined');
    });

    it('should throw if given a non-customElement constructor', function () {
      const config = {
        component: class App {},
        host
      };

      expect(() => {
        sut.app(config as any);
      }).to.throw('Invalid component. Must be a registered CustomElement class constructor or instance, but received: App');
    });

    it('should throw if given a non-customElement constructor', function () {
      const config = {
        component: class App {},
        host
      };

      expect(() => {
        sut.app(config as any);
      }).to.throw('Invalid component. Must be a registered CustomElement class constructor or instance, but received: App');
    });

    it('should throw if given a non-customElement instance', function () {
      const config = {
        component: new (class App {})(),
        host
      };

      expect(() => {
        sut.app(config as any);
      }).to.throw('Invalid component. Must be a registered CustomElement class constructor or instance, but received: App');
    });

    it('should restart with new component if already started', function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class { public msg: string = 'hi'; }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class { public msg: string = 'bye'; }
          ))()
        }
      );

      expect(sut.host.textContent, `sut.host.textContent`).to.equal('bye');
    });

    it('should restart with new host if already started', function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class { public msg: string = 'hi'; }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      const host1 = sut.host;

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      sut.app(
        {
          host: dom.createElement('app2')
        }
      );

      // expect(host1.textContent, `host1.textContent`).to.equal(''); // TODO: fix this
      // expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi'); // TODO: fix this
      expect(host1.textContent, `host1.textContent`).to.equal('hi');
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');
      expect(sut.host.nodeName, `sut.host.nodeName`).to.equal('app2');
    });

    it('should restart with new component and host if already started', function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class { public msg: string = 'hi'; }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      const host1 = sut.host;

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class { public msg: string = 'bye'; }
          ))(),
          host: dom.createElement('app2')
        }
      );

      expect(host1.textContent, `host1.textContent`).to.equal('');
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('bye');
      expect(sut.host.nodeName, `sut.host.nodeName`).to.equal('app2');
    });
  });

  describe('root()', function () {
    it('should return null if not initialized', function () {
      expect(sut.root(), `sut.root()`).to.equal(null);
    });

    it('should return next if only initialized with app()', function () {
      const config = {
        component: new (CustomElementResource.define({ name: 'app', template: '' }))(),
        host
      };
      sut.app(config);

      expect(sut.root(), `sut.root()`).to.equal(sut['next']);
      expect(sut.root(), `sut.root()`).to.equal(config.component);
    });

    it('should return _root if started', function () {
      const config = {
        component: new (CustomElementResource.define({ name: 'app', template: '' }))(),
        host
      };
      sut.app(config);
      sut.start();

      expect(sut.root(), `sut.root()`).to.equal(sut['next']);
      expect(sut.root(), `sut.root()`).to.equal(sut['_root']);
      expect(sut.root(), `sut.root()`).to.equal(config.component);
    });
  });

  describe('start()', function () {
    it('should start synchronously', function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class { public msg: string = 'hi'; }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');
    });

    it('should start with async binding() hook', async function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string;
              public async binding() {
                await Promise.resolve();
                this.msg = 'hi';
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      await sut.wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');
    });

    it('should start with async attaching() hook', async function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string;
              public async attaching() {
                await Promise.resolve();
                this.msg = 'hi';
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      await sut.wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');
    });

    it('should start with async binding() and attaching() hooks', async function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string;
              public async binding() {
                await Promise.resolve();
                this.msg = 'hi1';
              }
              public async attaching() {
                await Promise.resolve();
                this.msg = 'hi2';
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      await sut.wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi2');
    });

    it('should correctly handle multiple start/stop with async hooks', async function () {
      let bindingCount = 0;
      let attachingCount = 0;
      let detachingCount = 0;
      let unbindingCount = 0;
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string = 'hi';
              public async binding() {
                await Promise.resolve();
                ++bindingCount;
              }
              public async attaching() {
                await Promise.resolve();
                ++attachingCount;
              }
              public async detaching() {
                await Promise.resolve();
                ++detachingCount;
              }
              public async unbinding() {
                await Promise.resolve();
                ++unbindingCount;
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      await sut.start().wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      expect(bindingCount, `bindingCount`).to.equal(1);
      expect(attachingCount, `attachingCount`).to.equal(1);

      expect(detachingCount, `detachingCount`).to.equal(0);
      expect(unbindingCount, `unbindingCount`).to.equal(0);

      await sut.stop().wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      expect(bindingCount, `bindingCount`).to.equal(1);
      expect(attachingCount, `attachingCount`).to.equal(1);

      expect(detachingCount, `detachingCount`).to.equal(1);
      expect(unbindingCount, `unbindingCount`).to.equal(1);

      await sut.start().wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      expect(bindingCount, `bindingCount`).to.equal(2);
      expect(attachingCount, `attachingCount`).to.equal(2);

      expect(detachingCount, `detachingCount`).to.equal(1);
      expect(unbindingCount, `unbindingCount`).to.equal(1);

      await sut.stop().wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      expect(bindingCount, `bindingCount`).to.equal(2);
      expect(attachingCount, `attachingCount`).to.equal(2);

      expect(detachingCount, `detachingCount`).to.equal(2);
      expect(unbindingCount, `unbindingCount`).to.equal(2);

      await sut.start().wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      expect(bindingCount, `bindingCount`).to.equal(3);
      expect(attachingCount, `attachingCount`).to.equal(3);

      expect(detachingCount, `detachingCount`).to.equal(2);
      expect(unbindingCount, `unbindingCount`).to.equal(2);

      await sut.stop().wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      expect(bindingCount, `bindingCount`).to.equal(3);
      expect(attachingCount, `attachingCount`).to.equal(3);

      expect(detachingCount, `detachingCount`).to.equal(3);
      expect(unbindingCount, `unbindingCount`).to.equal(3);
    });

    it('should correctly handle start/stop with async hooks without awaiting start first', async function () {
      let bindingCount = 0;
      let attachingCount = 0;
      let detachingCount = 0;
      let unbindingCount = 0;
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string = 'hi';
              public async binding() {
                await Promise.resolve();
                ++bindingCount;
              }
              public async attaching() {
                await Promise.resolve();
                ++attachingCount;
              }
              public async detaching() {
                await Promise.resolve();
                ++detachingCount;
              }
              public async unbinding() {
                await Promise.resolve();
                ++unbindingCount;
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      expect(bindingCount, `bindingCount`).to.equal(0);
      expect(attachingCount, `attachingCount`).to.equal(0);

      expect(detachingCount, `detachingCount`).to.equal(0);
      expect(unbindingCount, `unbindingCount`).to.equal(0);

      await sut.stop().wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      expect(bindingCount, `bindingCount`).to.equal(1);
      expect(attachingCount, `attachingCount`).to.equal(1);

      expect(detachingCount, `detachingCount`).to.equal(1);
      expect(unbindingCount, `unbindingCount`).to.equal(1);
    });

    it('should correctly handle multiple start/stop with async hooks without awaiting any first', async function () {
      let bindingCount = 0;
      let attachingCount = 0;
      let detachingCount = 0;
      let unbindingCount = 0;
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string = 'hi';
              public async binding() {
                await Promise.resolve();
                ++bindingCount;
              }
              public async attaching() {
                await Promise.resolve();
                ++attachingCount;
              }
              public async detaching() {
                await Promise.resolve();
                ++detachingCount;
              }
              public async unbinding() {
                await Promise.resolve();
                ++unbindingCount;
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();
      sut.stop();
      sut.start();
      sut.stop();
      sut.start();
      sut.stop();

      await sut.wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      expect(bindingCount, `bindingCount`).to.equal(3);
      expect(attachingCount, `attachingCount`).to.equal(3);

      expect(detachingCount, `detachingCount`).to.equal(3);
      expect(unbindingCount, `unbindingCount`).to.equal(3);
    });
  });

  describe('stop()', function () {
    it('should stop synchronously', function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class { public msg: string = 'hi'; }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      sut.stop();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');
    });

    it('should stop with async unbinding() hook', async function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string = 'hi';
              public async unbinding() {
                await Promise.resolve();
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      sut.stop();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');

      await sut.wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');
    });

    it('should stop with async detaching() hook', async function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string = 'hi';
              public async detaching() {
                await Promise.resolve();
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      sut.stop();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      await sut.wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');
    });

    it('should stop with async unbinding() and detaching() hooks', async function () {
      sut.app(
        {
          component: new (CustomElementResource.define(
            AuDOMTest.createTextDefinition('msg'),
            class {
              public msg: string = 'hi';
              public async detaching() {
                await Promise.resolve();
              }
              public async unbinding() {
                await Promise.resolve();
              }
            }
          ))(),
          host: dom.createElement('app')
        }
      );

      sut.start();

      expect(sut.isRunning, `sut.isStarted`).to.equal(true);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      sut.stop();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('hi');

      await sut.wait();

      expect(sut.isRunning, `sut.isStarted`).to.equal(false);
      expect(sut.host.textContent, `sut.host.textContent`).to.equal('');
    });
  });
});
