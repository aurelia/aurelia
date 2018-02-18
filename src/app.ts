import { Scope, createOverrideContext } from './framework/scope';
import { Observer } from './framework/property-observation';
import { IObservable } from './framework/binding';
import { IBinding } from './framework/ast';
import { Template, View } from './framework-new';
import { oneWay, twoWay, listener } from './framework-generated';

// Original User Code for App

// export class App {
//   message = 'Hello World!';
// }

// <span>${message}</span><br>
// <input type="text" value.bind="message">
// <name-tag name.bind="message"></name-tag>

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
  private $anchor: Element;
  private $view: View;
  private $b1: IBinding;
  private $b2: IBinding;
  private $b3: IBinding;
  private $e1: NameTag;

  private $scope: Scope = {
    bindingContext: this,
    overrideContext: createOverrideContext()
  };

  private static $template = new Template(`
    <span class="au"></span><br>
    <input type="text" class="au">
    <name-tag class="au"></name-tag>
  `);

  hydrate(anchor: Element) {
    this.$anchor = anchor;
    this.$view = App.$template.create();

    let targets = this.$view.targets;

    this.$b1 = oneWay('message', targets[0], 'textContent');
    this.$b2 = twoWay('message', targets[1], 'value');

    this.$e1 = new NameTag().hydrate(targets[2]);
    this.$b3 = twoWay('message', this.$e1, 'name');

    return this;
  }

  attach() {
    this.$e1.attach();
    this.$view.appendNodesTo(this.$anchor);
  }

  bind() {
    let $scope = this.$scope;
    this.$b1.bind($scope);
    this.$b2.bind($scope);
    this.$e1.bind();
    this.$b3.bind($scope);
  }

  detach() {
    this.$view.removeNodes();
    this.$e1.detach();    
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
    color: new Observer<string>('red'),
    borderColor: new Observer('orange'),
    borderWidth: new Observer(3),
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
  private $anchor: Element;
  private $view: View;
  private $b1: IBinding;
  private $b2: IBinding;
  private $b3: IBinding;
  private $b4: IBinding;
  private $b5: IBinding;
  private $b6: IBinding;
  private $b7: IBinding;
  private $b8: IBinding;
  private $b9: IBinding;
  private $b10: IBinding;
  
  private $scope: Scope = {
    bindingContext: this,
    overrideContext: createOverrideContext()
  };

  private static $template = new Template(`
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
  `);

  hydrate(anchor: Element) {
    this.$anchor = anchor;
    this.$view = NameTag.$template.create();

    let targets = this.$view.targets;

    this.$b1 = twoWay('name', targets[0], 'value');
    this.$b2 = oneWay('name', targets[1], 'textContent');
    this.$b3 = oneWay('nameTagColor', (targets[1] as HTMLElement).style, 'color');
    this.$b4 = twoWay('nameTagColor', targets[2], 'value');
    this.$b5 = twoWay('nameTagBorderColor', targets[3], 'value');
    this.$b6 = twoWay('nameTagBorderWidth', targets[4], 'value');
    this.$b7 = twoWay('nameTagHeaderVisible', targets[5], 'checked');
    this.$b8 = listener('click', targets[6], 'submit');
    this.$b9 = oneWay('nameTagBorder', (anchor as HTMLElement).style, 'border');
    this.$b10 = oneWay('nameTagClasses', anchor, 'className');

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

  attach() {
    this.$view.appendNodesTo(this.$anchor);
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

  detach() {
    this.$view.removeNodes();
  }
}
