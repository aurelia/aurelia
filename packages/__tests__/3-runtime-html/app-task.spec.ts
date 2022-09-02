import { Registration } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/app-task.spec.ts', function () {
  it('runs app task with right timing', async function () {
    const logs = [];
    const addAppTaskLog = (name: string) => logs.push(`task.${name}`);
    const addCompLog = (name: string) => logs.push(`comp.${name}`);

    const { tearDown } = await createFixture(
      '${message}',
      class {
        constructor() { addCompLog('constructor'); }
        hydrating() { addCompLog('hydrating'); }
        hydrated() { addCompLog('hydrated'); }
        created() { addCompLog('created'); }
        binding() { addCompLog('binding'); }
        bound() { addCompLog('bound'); }
        attaching() { addCompLog('attaching'); }
        attached() { addCompLog('attached'); }
        detaching() { addCompLog('detaching'); }
        unbinding() { addCompLog('unbinding'); }
      },
      [
        AppTask.beforeCreate(() => { addAppTaskLog('creating'); }),
        AppTask.hydrating(() => { addAppTaskLog('hydrating'); }),
        AppTask.hydrated(() => { addAppTaskLog('hydrated'); }),
        AppTask.beforeActivate(() => { addAppTaskLog('activating'); }),
        AppTask.afterActivate(() => { addAppTaskLog('activated'); }),
        AppTask.beforeDeactivate(() => { addAppTaskLog('deactivating'); }),
        AppTask.afterDeactivate(() => { addAppTaskLog('deactivated'); }),
      ]
    ).started;

    logs.push('---');

    await tearDown();

    assert.deepStrictEqual(logs, [
      'comp.constructor',
      'task.creating',
      'task.hydrating',
      'comp.hydrating',
      'comp.hydrated',
      'task.hydrated',
      'comp.created',
      'task.activating',
      'comp.binding',
      'comp.bound',
      'comp.attaching',
      'comp.attached',
      'task.activated',
      '---',
      'task.deactivating',
      'comp.detaching',
      'comp.unbinding',
      'task.deactivated',
    ]);
  });

  it('retrieves the right injection when theres a token', async function () {
    let val = 1;
    await createFixture(
      '${message}',
      {},
      [
        Registration.instance('hello', val),
        AppTask.beforeCreate('hello', (v) => {
          assert.strictEqual(v, 1);
          val = 2;
        })
      ]
    ).started;
    assert.strictEqual(val, 2);
  });
});
