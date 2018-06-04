// import { DOM } from '../../../src/framework/dom';

// describe('dom', () => {
//   describe('createTemplateFromMarkup', () => {
//     it('should create a template from valid markup', () => {
//       expect(() => DOM.createTemplateFromMarkup('<template>this is valid!</template>')).toBeDefined();
//     });

//     it('should throw an error when creating a template from text-only markup', () => {
//       expect(() => DOM.createTemplateFromMarkup('throw an error!')).toThrow();
//     });

//     it('should throw an error when creating a template from markup where <template> is not the root element', () => {
//       expect(() => DOM.createTemplateFromMarkup('<div>throw an error!</div>')).toThrow();
//     });
//   });

//   describe('createAttribute', () => {
//     it('should create an attribute', () => {
//       expect(() => DOM.createAttribute('aurelia-app')).not.toBeFalsy();
//     });
//   });
// });

// describe('classList', () => {
//   it('Element', () => {
//     var element = DOM.createElement('p');
//     element.classList.add('foo');
//     expect(element.className).toBe('foo');
//     element.classList.add('bar');
//     expect(element.className).toBe('foo bar');
//     element.classList.remove('foo');
//     expect(element.className).toBe('bar');
//     element.classList.remove('bar');
//     expect(element.className).toBe('');
//   });
// });

// describe('classList', () => {
//   it('SVGElement', () => {
//     var element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
//     element.classList.add('foo');
//     expect(element.className.baseVal).toBe('foo');
//     element.classList.add('bar');
//     expect(element.className.baseVal).toBe('foo bar');
//     element.classList.remove('foo');
//     expect(element.className.baseVal).toBe('bar');
//     element.classList.remove('bar');
//     expect(element.className.baseVal).toBe('');
//   });
// });
