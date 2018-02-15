import { IBindingExpression, IBinding, Scope } from './core';
import { Observer, IObservable, getTargets, OneWay, TwoWay, Listener } from './framework';
// import { Scope } from './framework/scope';

// Original User Code
// export class App {
//   message = 'Hello World!';
// }

// <div>
//   <span>${message}</span><br>
//   <input type="text" value.bind="message">
// </div>

// ------------------------------

// Original User Code for NameTag

// export class NameTag {
//   name = 'Aurelia';
// }

// <template class="name-tag ${showHeader ? 'header-visible' : ''}">
// <header>Super Duper name tag</header>
// <div>
//   <input type="text" value.bind="name" ><br/>
//   <span class="au" style="font-weight: bold; padding: 10px 0;">${name}</span>
// </div>
// <hr/>
// <div>
//   <label>
//     Name tag color:
//     <select value.bind="color">
//       <option>red</option>
//       <option>green</option>
//       <option>blue</option>
//     </select>
//   </label>
// </div>
// <hr/>
// <div>
//   <label>
//     Name tag border color:
//     <select value.bind="borderColor">
//       <option>orange</option>
//       <option>black</option>
//       <option>rgba(0,0,0,0.5)</option>
//     </select>
//   </label>
// </div>
// <hr/>
// <div>
//   <label>
//     Name tag border width:
//     <input type="number" min="1" step="1" max="10" value.bind="borderWidth" />
//   </label>
// </div>
// <div>
//   <label>
//     Show header:
//     <input type="checkbox" value.bind="showHeader" />
//   </label>
// </div>
// <button click.trigger="submit()">Reset</button>

type ChildNode = Text | Comment | string | number | boolean | null | undefined | Element;

type NodeTuple = [string, Record<string, any>, IBinding[]];
type HnodeTuple = NodeTuple

interface TagMap {
  [id: number]: string;
};

const tagMap: TagMap = {
  1: 'div',

};

function h(
  tagTypeId: number,
  props: Record<string, any>,
  bindings: IBindingExpression[],
  ...children: ChildNode[]
) {

}

class ViewFactory {
  factory = [
    1, null, [],
    [
      1, null, []

    ],
    []
  ]
}

//Altered/Generated via a compile-time transform
class $App {
  $observers = {
    message: new Observer('Hello World!')
  };

  get message() { return this.$observers.message.getValue(); }
  set message(value: string) { this.$observers.message.setValue(value); }
}

export class App extends $App implements IObservable {
  private $host: Element;
  private $b1: OneWay;
  private $b2: TwoWay;
  private $b3: TwoWay;
  private $scope: Scope = {
    bindingContext: this,
    overrideContext: null
  };

  private static $html = `
    <div>
      <span class="au"></span><br>
      <input type="text" class="au">
      <name-tag class="au"></name-tag>
    </div>
  `;

  hydrate(element: Element) {
    this.$host = element;
    element.innerHTML = App.$html;

    let elements = getTargets(element);
    this.$b1 = new OneWay(this.$scope, 'message', elements[0], 'textContent');
    this.$b2 = new TwoWay(this.$scope, 'message', elements[1], 'value', ['input', 'change']);
    this.$b3 = new TwoWay(this.$scope, 'message', new NameTag().hydrate(elements[2]), 'name');

    return this;
  }

  bind() {
    this.$b1.bind();
    this.$b2.bind();
    this.$b3.bind();
  }

  unbind() {
    this.$b1.unbind();
    this.$b2.unbind();
    this.$b3.unbind();
  }
}

class $NameTag {
  $observers = {
    name: new Observer('Aurelia'),
    color: new Observer<string>(null),
    borderColor: new Observer('#000'),
    borderWidth: new Observer(1),
    showHeader: new Observer(true)
  };

  get name() { return this.$observers.name.getValue(); }
  set name(value: string) { this.$observers.name.setValue(value); }

  get color() { return this.$observers.color.getValue(); }
  set color(value: string) { this.$observers.color.setValue(value); }

  get borderColor() { return this.$observers.borderColor.getValue(); }
  set borderColor(value: string) { this.$observers.borderColor.setValue(value); }

  get borderWidth() { return this.$observers.borderWidth.getValue(); }
  set borderWidth(value: number) { this.$observers.borderWidth.setValue(value); }

  get showHeader() { return this.$observers.showHeader.getValue(); }
  set showHeader(value: boolean) { this.$observers.showHeader.setValue(value); }
}

export class NameTag extends $NameTag implements IObservable {
  private $host: Element;
  private $b1: TwoWay;
  private $b2: OneWay;
  private $b3: OneWay;
  private $b4: TwoWay;
  private $b5: TwoWay;
  private $b6: TwoWay;
  private $b7: TwoWay;
  private $b8: Listener;
  private $b9: OneWay;
  private $b10: OneWay;
  private $scope: Scope = {
    bindingContext: this,
    overrideContext: null
  };

  private static $html = `
    <header>Super Duper name tag</header>
    <div>
      <input type="text" class="au"><br/>
      <span class="au" style="font-weight: bold; padding: 10px 0;"></span>
    </div>
    <hr/>
    <div>
      <label>
        Name tag color:
        <select class="au">
          <option>red</option>
          <option>green</option>
          <option>blue</option>
        </select>
      </label>
    </div>
    <hr/>
    <div>
      <label>
        Name tag border color:
        <select class="au">
          <option>orange</option>
          <option>black</option>
          <option>rgba(0,0,0,0.5)</option>
        </select>
      </label>
    </div>
    <hr/>
    <div>
      <label>
        Name tag border width:
        <input type="number" class="au" min="1" step="1" max="10" />
      </label>
    </div>
    <div>
      <label>
        Show header:
        <input type="checkbox" class="au" />
      </label>
    </div>
    <button class="au">Reset</button>
  `

  hydrate(element: Element) {
    this.$host = element;
    element.innerHTML = NameTag.$html;

    let elements = getTargets(element);
    let $scope = this.$scope;
    this.$b1 = new TwoWay($scope, 'name', elements[0], 'value', ['change', 'input']);
    this.$b2 = new OneWay($scope, 'name', elements[1], 'textContent');
    this.$b3 = new OneWay($scope, 'nameTagColor', (elements[1] as HTMLElement).style, 'color');
    this.$b4 = new TwoWay($scope, 'nameTagColor', elements[2], 'value', ['change']);
    this.$b5 = new TwoWay($scope, 'nameTagBorderColor', elements[3], 'value', ['change']);
    this.$b6 = new TwoWay($scope, 'nameTagBorderWidth', elements[4], 'value', ['change', 'input']);
    this.$b7 = new TwoWay($scope, 'nameTagHeaderVisible', elements[5], 'checked', ['change']);
    this.$b8 = new Listener($scope, 'click', elements[6], 'click', null);
    this.$b9 = new OneWay($scope, 'nameTagBorder', (element as HTMLElement).style, 'border');
    this.$b10 = new OneWay($scope, 'nameTagClasses', element, 'className');

    return this;
  }

  observeProperty() {

  }

  bind() {
    this.$b1.bind();
    this.$b2.bind();
    this.$b3.bind();
    this.$b4.bind();
    this.$b5.bind();
    this.$b6.bind();
    this.$b7.bind();
    this.$b8.bind();
    this.$b9.bind();
    this.$b10.bind();
  }

  unbind() {
    this.$b1.unbind();
    this.$b2.unbind();
    this.$b3.unbind();
    this.$b4.unbind();
    this.$b5.unbind();
    this.$b6.unbind();
    this.$b7.unbind();
    this.$b8.unbind();
    this.$b9.unbind();
    this.$b10.unbind();
  }

  submit() {
    // alert('It was already updated, (two way binding thingy)');
    this.name = '' + Math.random();
  }
}


