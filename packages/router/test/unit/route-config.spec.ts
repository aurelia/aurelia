import { route } from '../../src/index';
import { expect } from 'chai';

// configuration API RFC: https://github.com/aurelia/aurelia/issues/164
describe('@routeConfig', () => {
  it('can define a basic route', () => {
    @route('home')
    class MyViewModel {}

    expect(MyViewModel['routes']).to.deep.equal([
      { path: 'home', component: MyViewModel }
    ]);
  });

  it('can define canonical urls', () => {
    @route('home')
    @route({ path: '', redirect: 'home' })
    class MyViewModel {}

    expect(MyViewModel['routes']).to.deep.equal([
      { path: '', redirect: 'home', component: MyViewModel },
      { path: 'home', component: MyViewModel }
    ]);
  });

  it('can define aliased routes', () => {
    @route(['', 'home'])
    class MyViewModel {}

    expect(MyViewModel['routes']).to.deep.equal([
      { path: '', component: MyViewModel },
      { path: 'home', component: MyViewModel }
    ]);
  });
});
