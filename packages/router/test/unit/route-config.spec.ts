import { route } from '../../src/index';
import { expect } from 'chai';
import { Reporter } from '@aurelia/kernel';

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

  xit('can define routes with custom viewports', () => {
    @route({ path: 'forwards', viewport: 'left' })
    @route({ path: 'backwards', viewport: 'right' })
    class MyViewModel {}

    expect(MyViewModel['routes']).to.deep.equal([
      { path: 'forwards', viewport: 'left', component: MyViewModel },
      { path: 'backwards', viewport: 'right', component: MyViewModel }
    ]);
  });

  xit('can define routes with custom viewports', () => {
    @route({ path: 'forwards', viewport: 'left' })
    @route({ path: 'backwards', viewport: 'right' })
    class MyViewModel {}

    expect(MyViewModel['routes']).to.deep.equal([
      { path: 'forwards', viewport: 'left', component: MyViewModel },
      { path: 'backwards', viewport: 'right', component: MyViewModel }
    ]);
  });

  xit('can define routes with custom viewports (reversed)', () => {
    @route({ path: 'forwards', viewport: 'right' })
    @route({ path: 'backwards', viewport: 'left' })
    class MyViewModel {}

    expect(MyViewModel['routes']).to.deep.equal([
      { path: 'forwards', viewport: 'right', component: MyViewModel },
      { path: 'backwards', viewport: 'left', component: MyViewModel }
    ]);
  });

  xit('raises a warning if configurations target the same path', () => {
    const originalWrite = Reporter.write;
    let errorCode: number;
    Reporter.write = (code) => {
      errorCode = code;
    };

    class MyViewModel {}
    route('home')(MyViewModel) // Warning! Duplicate route definition for path "home" in viewport "default".
    route({ path: 'home', viewport: 'side' })(MyViewModel) // OK.


    expect(errorCode).to.be.a('number');
    Reporter.write = originalWrite;
  });
});
