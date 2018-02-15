import {Observer, OneWay, TwoWay, getTargets} from './framework';

// Original User Code
// export class App {
//   message = 'Hello World!';
// }

// <div>
//   <span>${message}</span><br>
//   <input type="text" value.bind="message">
// </div>

//Altered/Generated via a compile-time transform
class $App {
  private $observers = {
    message: new Observer('Hello World!')
  };

  get message() { return this.$observers.message.getValue(); }
  set message(value: string) { this.$observers.message.setValue(value); }
}

export class App extends $App {
  private $host: Element;
  private $b1: OneWay;
  private $b2: TwoWay;
  private $scope = {
    bindingContext: this
  };

  private static $html = `
    <div>
      <span class="au"></span><br>
      <input type="text" class="au">
    </div>
  `;

  hydrate(element: Element) {
    this.$host = element;
    element.innerHTML = App.$html;

    let elements = getTargets(element);
    this.$b1 = new OneWay(this.$scope, 'message', elements[0], 'textContent');
    this.$b2 = new TwoWay(this.$scope, 'message', elements[1], 'value');
  }

  bind() {
    this.$b1.bind();
    this.$b2.bind();
  }
}
