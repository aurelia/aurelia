import { runTasks } from '@aurelia/runtime';
import { createFixture } from '@aurelia/testing';

describe('4-gh-issues/2155.spec.ts', function () {
  it('should react to array mutation inside interpolation binding', async function () {
    const { assertHtml, trigger } = createFixture(
      `<div repeat.for="item of items" class="\${activeItems.includes(item) ? 'active': ''}">
        <p click.trigger="setActive(item)">\${activeItems.includes(item) ? 'active': '&nbsp;'}</p>
      </div>`,
      class App {
        items = ['a'];
        activeItems: string[] = [];
        setActive(item: string) {
          const index = this.activeItems.indexOf(item);
          if (index > -1) {
            this.activeItems.splice(index, 1);
          } else {
            this.activeItems.push(item);
          }
        }
      }
    );

    trigger.click('p');
    runTasks();
    assertHtml('<div class="active"> <p>active</p> </div>', { compact: true });
  });
});
