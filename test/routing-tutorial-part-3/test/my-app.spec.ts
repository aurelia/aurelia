// import Aurelia, { CustomElement } from 'aurelia';
// import { MyApp } from '../src/my-app';

// function createAu(template: string, ...deps: readonly unknown[]) {
//   const wrapper = CustomElement.define({name: 'wrapper', template});
//   document.body.appendChild(document.createElement('wrapper'));
//   return Aurelia.register(deps).app(wrapper);
// }

// function cleanup() {
//   const wrapper = document.querySelector('wrapper');
//   if (wrapper) {
//     wrapper.remove();
//   }
// }

// describe('my-app', () => {
//   afterEach(() => {
//     cleanup();
//   });

//   it('should render message', async () => {
//     const au = createAu('<my-app></my-app>', MyApp);
//     await au.start().wait();
//     const node = document.querySelector('my-app');
//     const text =  node.textContent;
//     expect(text.trim()).toBe('Hello World!');
//     await au.stop().wait();
//     cleanup();
//   });
// });
