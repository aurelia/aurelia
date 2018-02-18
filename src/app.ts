import { IBinding } from './framework/ast';
import { Scope } from './framework/scope';
import { Observer } from './framework/property-observation';
import { getTargets, oneWay, twoWay, listener } from './framework';
import { IObservable, Binding } from './framework/binding';
import { Listener } from './framework/listener';

// Original User Code for App

// export class App {
//   message = 'Hello World!';
// }

// <div>
//   <span>${message}</span><br>
//   <input type="text" value.bind="message">
//   <name-tag name.bind="message"></name-tag>
// </div>

// ------------------------------

// Original User Code for NameTag

// export class NameTag {
//   name = 'Aurelia';
// }

//<template class="name-tag ${showHeader ? 'header-visible' : ''}">
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
//</template>

// ------------------------------

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
  private $b1: Binding;
  private $b2: Binding;
  private $b3: Binding;
  private $e1: NameTag;

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

    this.$b1 = oneWay('message', elements[0], 'textContent');
    this.$b2 = twoWay('message', elements[1], 'value');

    this.$e1 = new NameTag().hydrate(elements[2]);
    this.$b3 = twoWay('message', this.$e1, 'name');

    return this;
  }

  bind() {
    let $scope = this.$scope;
    this.$b1.bind($scope);
    this.$b2.bind($scope);
    this.$e1.bind();
    this.$b3.bind($scope);
  }

  unbind() {
    this.$b1.unbind();
    this.$b2.unbind();
    this.$b3.unbind();
    this.$e1.unbind();
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

  submit() {
    // alert('It was already updated, (two way binding thingy)');
    this.name = '' + Math.random();
  }
}

export class NameTag extends $NameTag implements IObservable {
  private $host: Element;
  private $b1: Binding;
  private $b2: Binding;
  private $b3: Binding;
  private $b4: Binding;
  private $b5: Binding;
  private $b6: Binding;
  private $b7: Binding;
  private $b8: Listener;
  private $b9: Binding;
  private $b10: Binding;
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

    this.$b1 = twoWay('name', elements[0], 'value');
    this.$b2 = oneWay('name', elements[1], 'textContent');
    this.$b3 = oneWay('nameTagColor', (elements[1] as HTMLElement).style, 'color');
    this.$b4 = twoWay('nameTagColor', elements[2], 'value');
    this.$b5 = twoWay('nameTagBorderColor', elements[3], 'value');
    this.$b6 = twoWay('nameTagBorderWidth', elements[4], 'value');
    this.$b7 = twoWay('nameTagHeaderVisible', elements[5], 'checked');
    this.$b8 = listener('click', elements[6], 'submit');
    this.$b9 = oneWay('nameTagBorder', (element as HTMLElement).style, 'border');
    this.$b10 = oneWay('nameTagClasses', element, 'className');

    return this;
  }

  bind() {
    let $scope = this.$scope;
    this.$b1.bind($scope);
    this.$b2.bind($scope);
    this.$b3.bind($scope);
    this.$b4.bind($scope);
    this.$b5.bind($scope);
    this.$b6.bind($scope);
    this.$b7.bind($scope);
    this.$b8.bind($scope);
    this.$b9.bind($scope);
    this.$b10.bind($scope);
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
}
