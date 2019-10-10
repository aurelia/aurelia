import { c, createLogger } from '../../logger';
import * as Benchmark from 'benchmark';
import { dev, local } from './aurelia';

const args = process.argv.slice(2);
const name = args[0];
const rest = args.slice(1);
const log = createLogger('lifecycle');

const suites = {
  ['bind']() {
    const count = parseInt(rest[0], 10);
    class LocalFoo {
      public static inject = [local.runtime.ILifecycle];
      public static register(container) {
        return local.kernel.Registration.transient(LocalFoo, this).register(container);
      }
      public $nextBound;
      public lifecycle;
      public constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.$nextBound = null;
      }
      public bound() { return; }
    }
    class DevFoo {
      public static inject = [dev.runtime.ILifecycle];
      public static register(container) {
        return dev.kernel.Registration.transient(DevFoo, this).register(container);
      }
      public $nextBound;
      public lifecycle;
      public constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.$nextBound = null;
      }
      public bound() { return; }
    }
    const localContainer = local.kernel.DI.createContainer();
    localContainer.register(LocalFoo);
    const localLifecycle = localContainer.get(local.runtime.ILifecycle);
    const localFoos = Array(count).fill(0).map(() => localContainer.get(LocalFoo));

    const devContainer = dev.kernel.DI.createContainer();
    devContainer.register(DevFoo);
    const devLifecycle = devContainer.get(dev.runtime.ILifecycle);
    const devFoos = Array(count).fill(0).map(() => devContainer.get(DevFoo));

    const suite = new Benchmark.Suite('bind', {
      onCycle: function(event) {
        log(`[${c.cyan(name)}] ${event.target}`);
      }
    });

    suite.add(`local beginBind+enqueueBound+endBind x ${count}`, function() {
      for (let i = 0; i < count; ++i) {
        localLifecycle.beginBind();
        localLifecycle.enqueueBound(localFoos[i]);
      }
      for (let i = 0; i < count; ++i) {
        localLifecycle.endBind(0);
      }
    });
    suite.add(`  dev beginBind+enqueueBound+endBind x ${count}`, function() {
      for (let i = 0; i < count; ++i) {
        devLifecycle.beginBind();
        devLifecycle.enqueueBound(devFoos[i]);
      }
      for (let i = 0; i < count; ++i) {
        devLifecycle.endBind(0);
      }
    });

    suite.run();
  }
};

suites[name]();
