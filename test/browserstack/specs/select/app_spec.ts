// NOTE: file intentionally named app_spec instead of app.spec so it doesn't get picked up by the test runner (as the tests are commented out and there are no tests to run,
// avoid the unnecessary overhead of starting up browserstack for it)
// import { expect } from 'chai';
// import { AppPage } from './app.page';
// import { isSafari, isEdge } from '../common';

// const selectMap = {
//   0: 'zero',
//   1: 'one',
//   2: 'two',
//   3: 'three',
//   4: 'four',
//   5: 'five',
//   6: 'six',
//   7: 'seven',
//   8: 'eight',
//   9: 'nine'
// };

// describe(`Select App - `, function () {
//   beforeEach(function () {
//     browser.url('index.select.html');
//   });

//   describe(`Loads with correct initial values`, function () {
//     const selectText = 'zero';
//     const selectValue = '0';

//     // it(`selected text: "${selectText}"`, function () {
//     //   const actual = AppPage.selectedText();
//     //   expect(actual).to.equal(selectText);
//     // });

//     it(`selected value: ${selectValue}`, function () {
//       const actual = AppPage.selectedValue;
//       expect(actual).to.equal(selectValue);
//     });
//   });

//   // TODO: make this work for safari
//   if (!isSafari()) {
//     describe(`Change single selection`, function () {

//       it(`select each item one by one by index`, function () {
//         for (let i = 0; i < 10; ++i) {
//           AppPage.setSelectByIndex(i);
//           expect(AppPage.selectedValue).to.equal(i+'');
//         }
//       });
//     });
//   }

//   // TODO: make this work for edge/safari
//   if (!(isEdge() || isSafari())) {
//     describe(`Change multiple selection`, function () {
//       beforeEach(function () {
//         AppPage.checkCheckbox();
//       });

//       it(`select each item simultaneously`, function () {
//         AppPage.setSelectByIndex(0); // deselect first element before starting loop
//         for (let i = 0; i < 10; ++i) {
//           AppPage.setSelectByIndex(i);
//           expect(AppPage.option(i).isSelected()).to.equal(true);
//         }
//       });

//       it(`select and deselects each item right away`, function () {
//         AppPage.setSelectByIndex(0); // deselect first element before starting loop
//         for (let i = 0; i < 10; ++i) {
//           AppPage.setSelectByIndex(i);
//           AppPage.setSelectByIndex(i);
//           expect(AppPage.option(i).isSelected()).to.equal(false);
//         }

//         expect(AppPage.options.filter(o => o.isSelected()).length).to.equal(0);
//       });
//     });
//   }
// });
