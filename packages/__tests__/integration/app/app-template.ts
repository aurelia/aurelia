// this is needed to dynamically test `.app` and `.enhance`
export const appTemplate =  `
<style>
  .selected {
    background-color: rgb(255, 0, 0);
  }

  .selectedDetails {
    color: rgb(106, 106, 106);
  }

</style>
<div frequent-mutations>
  <button id="staticTextChanger" click.delegate="changeTexts()">Change texts</button>
  <read-only-text id="text0" value="text0"></read-only-text>
  <read-only-text id="text1" value.one-time="text1"></read-only-text>
  <read-only-text id="text2" value.bind="text2"></read-only-text>
  <read-only-text id="text3" value.to-view="text3"></read-only-text>
  <read-only-text id="interpolated-text" value="interpolated: \${text4}\${text5}"></read-only-text>

  <text-input id="input-static" value="input0"></text-input>
  <text-input id="input-one-time" value.one-time="inputOneTime"></text-input>
  <text-input id="input-two-way" value.two-way="inputTwoWay"></text-input>
  <text-input id="input-to-view" value.to-view="inputToView"></text-input>
  <text-input id="input-from-view" value.from-view="inputFromView"></text-input>

  <text-input id="blurred-input-two-way" value.two-way="inputBlrTw" trigger="blur"></text-input>
  <text-input id="blurred-input-from-view" value.from-view="inputBlrFv" trigger="blur"></text-input>

  <!-- <specs-viewer things.bind="things"></specs-viewer> -->

  <user-preference user.bind="user"></user-preference>
  <radio-button-list
    choices1.to-view="contacts1" chosen1.two-way="chosenContact1"
    choices2.to-view="contacts2" chosen2.two-way="chosenContact2"
    choices3.to-view="contacts3" chosen3.two-way="chosenContact3"
    choices4.to-view="contacts4" chosen4.two-way="chosenContact4" matcher.bind="matcher"
    choices5.to-view="contacts5" chosen5.two-way="chosenContact5"
    choices6.to-view="contacts6" chosen6.two-way="chosenContact6"
    choices7.to-view="contacts7" chosen7.two-way="chosenContact7"
  ></radio-button-list>
  <tri-state-boolean value.two-way="likesCake" no-value-display.bind="noDisplayValue" true-display.bind="trueValue" false-display.bind="falseValue"></tri-state-boolean>

  <label id='consent'>
    <input type="checkbox" checked.two-way="hasAgreed">
    I agree
  </label>

  <checkbox-list
    choices1.to-view="products1" selected-items1.bind="chosenProducts1"
    choices2.to-view="products2" selected-items2.bind="chosenProducts2" matcher.bind="productMatcher"
  ></checkbox-list>

  <command name="do something" action.call="doSomething()"></command>
  <let-demo></let-demo>

  <select-dropdown
    options1.bind="items1" selection1.two-way="selectedItem1"
    options2.bind="items2" selection2.two-way="selectedItem2"
    options3.bind="items3" selection3.two-way="selectedItem3" matcher.bind="optionMatcher"
    options4.bind="items4" selection4.two-way="selectedItem4"
    selections1.two-way="selectedItems1"
    selections2.two-way="selectedItems2"
    selections3.two-way="selectedItems3"
    selections4.two-way="selectedItems4"
  ></select-dropdown>

  <cards items.bind="heroes" selected.bind="selectedHero"></cards>

  <random-generator></random-generator>
</div>
`;
