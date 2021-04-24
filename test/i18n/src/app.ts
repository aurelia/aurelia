import { bindable, customElement } from '@aurelia/runtime-html';
// import template from './app.html';

// @customElement({
//   name: 'child',
//   template: `Id: \${id}. Child \${text}`
// })
// export class Child {
//   private static id = 0;
//   @bindable public text: string = undefined;

//   private readonly id = Child.id++;
// }

// @customElement({
//   name: 'notch',
//   template: `Notch <au-slot></au-slot>`,
// })
// export class Notch { }

// @customElement({
//   name: 'elem',
//   template: `Parent \${text}
//   <notch>
//     <child au-slot text.bind="text"></child>
//   </notch>`,
//   dependencies: [Child, Notch]
// })
// export class Elem {
//   @bindable public text: string = undefined;
// }

@customElement({
  name: 'my-element',
  template: `<div with.bind="{item: people[0]}"><au-slot>\${item.firstName}</au-slot></div>`
})
export class MyElement {
  @bindable public people: Person[];
}
@customElement({
  name: 'app',
  template: `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot>\${item.lastName}</div> </my-element>`,
  dependencies: [MyElement],
  // template: `<elem text="1"></elem>
  // <br>
  // <elem text="2"></elem>`,
  // dependencies: [Elem],
})
export class App {
  public readonly people: Person[] = [
    new Person('John', 'Doe', ['Browny', 'Smokey']),
    new Person('Max', 'Mustermann', ['Sea biscuit', 'Swift Thunder']),
  ];

}
class Person {
  public constructor(
    public firstName: string,
    public lastName: string,
    public pets: string[],
  ) { }
}
