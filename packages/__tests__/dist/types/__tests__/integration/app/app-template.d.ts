export declare const appTemplate = "\n<style>\n  .selected {\n    background-color: rgb(255, 0, 0);\n  }\n\n  .selectedDetails {\n    color: rgb(106, 106, 106);\n  }\n\n</style>\n<div frequent-mutations>\n  <button id=\"staticTextChanger\" click.delegate=\"changeTexts()\">Change texts</button>\n  <read-only-text id=\"text0\" value=\"text0\"></read-only-text>\n  <read-only-text id=\"text1\" value.one-time=\"text1\"></read-only-text>\n  <read-only-text id=\"text2\" value.bind=\"text2\"></read-only-text>\n  <read-only-text id=\"text3\" value.to-view=\"text3\"></read-only-text>\n  <read-only-text id=\"interpolated-text\" value=\"interpolated: ${text4}${text5}\"></read-only-text>\n\n  <text-input id=\"input-static\" value=\"input0\"></text-input>\n  <text-input id=\"input-one-time\" value.one-time=\"inputOneTime\"></text-input>\n  <text-input id=\"input-two-way\" value.two-way=\"inputTwoWay\"></text-input>\n  <text-input id=\"input-to-view\" value.to-view=\"inputToView\"></text-input>\n  <text-input id=\"input-from-view\" value.from-view=\"inputFromView\"></text-input>\n\n  <text-input id=\"blurred-input-two-way\" value.two-way=\"inputBlrTw\" trigger=\"blur\"></text-input>\n  <text-input id=\"blurred-input-from-view\" value.from-view=\"inputBlrFv\" trigger=\"blur\"></text-input>\n\n  <!-- <specs-viewer things.bind=\"things\"></specs-viewer> -->\n\n  <user-preference user.bind=\"user\"></user-preference>\n  <radio-button-list\n    choices1.to-view=\"contacts1\" chosen1.two-way=\"chosenContact1\"\n    choices2.to-view=\"contacts2\" chosen2.two-way=\"chosenContact2\"\n    choices3.to-view=\"contacts3\" chosen3.two-way=\"chosenContact3\"\n    choices4.to-view=\"contacts4\" chosen4.two-way=\"chosenContact4\" matcher.bind=\"matcher\"\n    choices5.to-view=\"contacts5\" chosen5.two-way=\"chosenContact5\"\n    choices6.to-view=\"contacts6\" chosen6.two-way=\"chosenContact6\"\n    choices7.to-view=\"contacts7\" chosen7.two-way=\"chosenContact7\"\n  ></radio-button-list>\n  <tri-state-boolean value.two-way=\"likesCake\" no-value-display.bind=\"noDisplayValue\" true-display.bind=\"trueValue\" false-display.bind=\"falseValue\"></tri-state-boolean>\n\n  <label id='consent'>\n    <input type=\"checkbox\" checked.two-way=\"hasAgreed\">\n    I agree\n  </label>\n\n  <checkbox-list\n    choices1.to-view=\"products1\" selected-items1.bind=\"chosenProducts1\"\n    choices2.to-view=\"products2\" selected-items2.bind=\"chosenProducts2\" matcher.bind=\"productMatcher\"\n  ></checkbox-list>\n\n  <command name=\"do something\" action.call=\"doSomething()\"></command>\n  <let-demo></let-demo>\n\n  <select-dropdown\n    options1.bind=\"items1\" selection1.two-way=\"selectedItem1\"\n    options2.bind=\"items2\" selection2.two-way=\"selectedItem2\"\n    options3.bind=\"items3\" selection3.two-way=\"selectedItem3\" matcher.bind=\"optionMatcher\"\n    options4.bind=\"items4\" selection4.two-way=\"selectedItem4\"\n    selections1.two-way=\"selectedItems1\"\n    selections2.two-way=\"selectedItems2\"\n    selections3.two-way=\"selectedItems3\"\n    selections4.two-way=\"selectedItems4\"\n  ></select-dropdown>\n\n  <cards items.bind=\"heroes\" selected.bind=\"selectedHero\"></cards>\n\n  <random-generator></random-generator>\n</div>\n";
//# sourceMappingURL=app-template.d.ts.map