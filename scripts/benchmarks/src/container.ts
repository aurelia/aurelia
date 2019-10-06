import { c, createLogger } from '../../logger';
import * as Benchmark from 'benchmark';
import { dev, local } from './aurelia';

const args = process.argv.slice(2);
const name = args[0];
const rest = args.slice(1);
const log = createLogger('container');

const suites = {
  ['register']() {
    const suite = new Benchmark.Suite('register', {
      onCycle: function(event) {
        log(`[${c.cyan(name)}] ${event.target}`);
      }
    });

    suite.add(`local runtime-html BasicConfiguration`, function() {
      local.kernel.DI.createContainer().register(local.runtimeHtml.BasicConfiguration);
    });
    suite.add(`local jit-html     BasicConfiguration`, function() {
      local.kernel.DI.createContainer().register(local.jitHtml.BasicConfiguration);
    });

    suite.add(`  dev runtime-html BasicConfiguration`, function() {
      dev.kernel.DI.createContainer().register(dev.runtimeHtml.HTMLRuntimeConfiguration);
    });
    suite.add(`  dev jit-html     BasicConfiguration`, function() {
      dev.kernel.DI.createContainer().register(dev.jitHtml.HTMLJitConfiguration);
    });

    suite.run();
  },
  ['resolve']() {
    const count = parseInt(rest[0], 10);
    class LocalSingleton {
      public static register(container) {
        return local.kernel.Registration.singleton(LocalSingleton, this).register(container);
      }
    }
    class LocalTransient {
      public static register(container) {
        return local.kernel.Registration.transient(LocalTransient, this).register(container);
      }
    }
    class DevSingleton {
      public static register(container) {
        return dev.kernel.Registration.singleton(DevSingleton, this).register(container);
      }
    }
    class DevTransient {
      public static register(container) {
        return dev.kernel.Registration.transient(DevTransient, this).register(container);
      }
    }
    const localContainer = local.kernel.DI.createContainer();
    localContainer.register(LocalSingleton, LocalTransient);
    const devContainer = dev.kernel.DI.createContainer();
    devContainer.register(DevSingleton, DevTransient);

    const suite = new Benchmark.Suite('resolve', {
      setup: function() {
        return;
      },
      onCycle: function(event) {
        log(`[${c.cyan(name)}] ${event.target}`);
      }
    });

    suite.add(`local transient x ${count}`, function() {
      for (let i = 0; i < count; ++i) {
        localContainer.get(LocalTransient);
      }
    });
    suite.add(`  dev transient x ${count}`, function() {
      for (let i = 0; i < count; ++i) {
        devContainer.get(DevTransient);
      }
    });

    suite.add(`local singleton x ${count}`, function() {
      for (let i = 0; i < count; ++i) {
        localContainer.get(LocalSingleton);
      }
    });
    suite.add(`  dev singleton x ${count}`, function() {
      for (let i = 0; i < count; ++i) {
        devContainer.get(DevSingleton);
      }
    });

    suite.run();
  }
};

suites[name]();
