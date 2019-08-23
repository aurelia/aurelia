import { ViewValueConverter } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe.only('the view value converter', () => {
  it('delegates view location to the view locator service', () => {
    const fakeResult = class Component {};
    const fakeViewLocator = {
      object: null,
      viewName: null,
      getViewComponentForObject(object, viewName) {
        this.object = object;
        this.viewName = viewName;
        return fakeResult;
      }
    };

    const converter = new ViewValueConverter(fakeViewLocator);
    const object = {} as any;
    const viewName = 'view-name';

    const result = converter.toView(object, viewName);

    assert.equal(fakeViewLocator.object, object);
    assert.equal(fakeViewLocator.viewName, viewName);
    assert.equal(result, fakeResult);
  });
});
