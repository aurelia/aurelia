import { createOverrideContext } from './framework/binding/scope';
import { Scope } from './framework/binding/binding-interfaces';
import { Observer } from './framework/binding/property-observation';
import { IBinding } from './framework/binding/binding';
import { oneWay, twoWay, listener, oneWayText, makeElementIntoAnchor, ref } from './framework/generated';
import { View } from './framework/templating/view';
import { IComponent } from './framework/templating/component';
import { If } from './framework/resources/if';
import { ViewSlot } from './framework/templating/view-slot';
import { Else } from './framework/resources/else';
import { Visual } from './framework/templating/visual';
import { Template } from './framework/templating/template';

// Original User Code for App

// export class App {
//   message = 'Hello World!';
// }

// <template>
//   ${message}<br>
//   <input type="text" value.bind="message">
//   <name-tag name.bind="message" component.ref="nameTag"></name-tag>
//   <input type="checkbox" value.bind="duplicateMessage" />
//   <div if.bind="duplicateMessage">
//     ${message}
//   </div>
//   <div else>No Message Duplicated</div>
// </template>

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
  $observers: Record<string, Observer<any>>;

  constructor() {
    Object.defineProperty(this, '$observers', {
      enumerable: false,
      value: {
        message: new Observer('Hello World!'),
        duplicateMessage: new Observer(true)
      }
    });
  }

  get duplicateMessage() { return this.$observers.duplicateMessage.getValue(); }
  set duplicateMessage(value: boolean) { this.$observers.duplicateMessage.setValue(value); }

  get message() { return this.$observers.message.getValue(); }
  set message(value: string) { this.$observers.message.setValue(value); }
}

class $PlainView1 extends Visual {
  private $b1: IBinding;

  private static $template = new Template('<div><au-marker class="au"></au-marker> </div>');

  constructor() {
    super($PlainView1.$template);
    let targets = this.$view.targets;
    this.$b1 = oneWayText('message', targets[0]);
  }

  bind(scope: Scope) {
    super.bind(scope);
    this.$b1.bind(scope);
  }

  unbind() {
    super.unbind();
    this.$b1.unbind();
  }
}

class $PlainView2 extends Visual {
  private static $template = new Template('<div>No Message Duplicated</div>');

  constructor() {
    super($PlainView2.$template);
  }
}

export class App extends $App implements IComponent {
  private $b1: IBinding;
  private $b2: IBinding;
  private $b3: IBinding;
  private $b4: IBinding;
  private $b5: IBinding;
  private $b6: IBinding;
  private $c1: IComponent;
  private $a1: If;
  private $a2: Else;

  private $view: View;
  private $anchor: Element;

  private $scope: Scope = {
    bindingContext: this,
    overrideContext: createOverrideContext()
  };

  private static $template = new Template(`
    <au-marker class="au"></au-marker> <br>
    <input type="text" class="au">
    <name-tag class="au"></name-tag>
    <input type="checkbox" class="au" />
    <au-marker class="au"></au-marker>
    <au-marker class="au"></au-marker>
  `);

  applyTo(anchor: Element) {
    this.$anchor = anchor;
    this.$view = App.$template.create();

    let targets = this.$view.targets;

    this.$b1 = oneWayText('message', targets[0]);
    this.$b2 = twoWay('message', targets[1], 'value');

    this.$c1 = new NameTag().applyTo(targets[2]);
    this.$b3 = twoWay('message', this.$c1, 'name');
    this.$b6 = ref(this.$c1, 'nameTag');

    this.$b4 = twoWay('duplicateMessage', targets[3], 'checked');

    this.$a1 = new If(() => new $PlainView1(), new ViewSlot(makeElementIntoAnchor(targets[4]), false));
    this.$b5 = oneWay('duplicateMessage', this.$a1, 'condition');

    this.$a2 = new Else(() => new $PlainView2(), new ViewSlot(makeElementIntoAnchor(targets[5]), false)).link(this.$a1);

    //this.created(); //if developer implemented this callback

    return this;
  }

  //bound bubbles up the tree after binding happens
  //property change events always fire, but in a group at the end of binding, but before bound

  bind() {
    let scope = this.$scope;

    this.$b1.bind(scope);
    this.$b2.bind(scope);
    this.$b4.bind(scope);

    this.$b3.bind(scope); //input bindings set before component bind
    this.$b6.bind(scope);
    this.$c1.bind();

    this.$b5.bind(scope); //input bindings set before attribute bind
    this.$a1.bind(scope);

    this.$a2.bind(scope);

    //this.bound(); //if developer implemented this callback
  }

  //attaching tunnels down the tree before the dom attach happens
  //attached bubbles up the tree after the dom attach happens

  attach() {
    //this.attaching(); //if developer implemented this callback
    this.$c1.attach();
    this.$a1.attach();
    this.$a2.attach();
    this.$view.appendTo(this.$anchor); //attach children before the parent
    //TaskQueue.instance.queueMicroTask(() => this.attached()); //queue callback if developer implemented it
  }

  detach() {
    //this.detaching(); //if developer implemented this callback
    this.$view.remove(); //remove parent before detaching children
    this.$c1.detach();
    this.$a1.detach();
    this.$a2.detach();
    //TaskQueue.instance.queueMicroTask(() => this.detached()); //queue callback if developer implemented it
  }

  unbind() {
    this.$b1.unbind();
    this.$b2.unbind();
    this.$b3.unbind();
    this.$b6.unbind();
    this.$c1.unbind();
    this.$a1.unbind();
    this.$a2.unbind();
    this.$b4.unbind();
    this.$b5.unbind();
  }
}

class $NameTag {
  $observers: Record<string, Observer<any>>;
  $isBound = false;

  constructor() {
    Object.defineProperty(this, '$observers', {
      enumerable: false,
      value: {
        name: new Observer('Aurelia', v => this.$isBound ? this.nameChanged(v) : void 0),
        color: new Observer<string>('red'),
        borderColor: new Observer('orange'),
        borderWidth: new Observer(3),
        showHeader: new Observer(true)
      }
    });
  }

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

  nameChanged(newValue: string) {
    console.log(`Name changed to ${newValue}`);;
  }

  submit() {
    // alert('It was already updated, (two way binding thingy)');
    this.name = '' + Math.random();
  }
}

export class NameTag extends $NameTag implements IComponent {
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
  private $anchor: Element;
  private $scope: Scope = {
    bindingContext: this,
    overrideContext: createOverrideContext()
  };

  $view: View;

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

  applyTo(anchor: Element) {
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

    //this.created(); //if developer implemented this callback

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

    this.$isBound = true;
    this.nameChanged(this.name); //all change events fire after all bindings are setup

    //this.bound(); //if developer implemented this callback
  }

  attach() {
    this.$view.appendTo(this.$anchor);
  }

  detach() {
    this.$view.remove();
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
