// import { TestBuilder as Test, DefinitionBuilder as D, InstructionBuilder as I } from './test-builder';

// describe('runtime', function () {
//   it('1', function () {
//     const appState = { show: true };
//     const definition =
//     D.if(
//       I.toView('show'),
//       D.interpolation('\'if\'')
//     ).else(
//       D.interpolation('\'else\'')
//     );
//     const test = Test.app(appState, definition).build();

//     test.start();
//     test.assertTextContentEquals('if');

//     test.component.show = false;
//     test.flush();
//     test.assertTextContentEquals('else');

//     test.stop();
//     test.assertTextContentEmpty();

//     test.dispose();
//   });

//   it('2', function () {
//     const appState = { items: [{ childItems: ['a', 'b', 'c'] }] };
//     const definition =
//     D.if(
//       I.toView('items.length'),
//       D.repeat(
//         I.iterator('item of items', 'items'),
//         D.with(
//           I.toView('item'),
//           D.if(
//             I.toView('childItems.length', 'value'),
//             D.repeat(
//               I.iterator('childItem of childItems', 'items'),
//               D.interpolation('childItem')
//             )
//           ).else(
//             D.interpolation('\'no-childItems\'')
//           )
//         )
//       )
//     ).else(
//       D.interpolation('\'no-items\'')
//     );
//     const test = Test.app(appState, definition).build();

//     test.start();
//     test.assertTextContentEquals('abc');

//     test.component.items.splice(0);
//     test.flush();
//     test.assertTextContentEquals('no-items');

//     test.component.items.push({ childItems: [] });
//     test.flush();
//     test.assertTextContentEquals('no-childItems');

//     test.stop();
//     test.assertTextContentEmpty();

//     test.dispose();
//   });
// });
