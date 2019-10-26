import { customElement } from '@aurelia/runtime';
import template from './app.html';
import { Camera, Zoom } from './molecules/specs-viewer/camera-specs-viewer';
import { Laptop, Storage } from './molecules/specs-viewer/laptop-specs-viewer';
import { User } from './molecules/user-preference/user-preference';
import { Thing } from './molecules/specs-viewer/thing-viewer';
import { SelectOption } from './atoms/select-dropdown/select-dropdown';

type Contact = { number: number; type: string };
export type Product = { id: number; name: string };

type Item = { id: number; name: string };

@customElement({ name: 'app', template })
export class App {
  private text1: string = 'text1';
  private text2: string = 'text2';
  private text3: string = 'text3';
  public text4: string = 'foo';
  public text5: string = 'bar';

  public inputOneTime: string = 'input1';
  public inputTwoWay: string = 'input2';
  public inputToView: string = 'input3';
  public inputFromView: string = 'input4';
  public inputBlrTw: string = 'input5';
  public inputBlrFv: string = 'input6';

  public things: Thing[] = [new Camera(new Zoom(40, 4), [125, 1600, 3200, 6400], [4, 16], [3, 6.5], 'Coolpix B500', 'Nikon'), new Laptop('Core i5 3.40 GHz', '8GB DDR4', new Storage('SSD', 1, 'TB'), '14 inch', 'T460', 'Lenovo')];

  // computed
  public user: User = new User('John', 'Doe', 0.1, 'Role1', 'Org1', 'City1', 'Country1');

  // #region checked, map, repeat
  public contacts1: Map<number, string> = new Map<number, string>([[123456790, 'mobile'], [9087654321, 'work'], [1122334455, 'home']]);
  public contacts2: Map<number, string> = new Map<number, string>(Array.from(this.contacts1));
  public chosenContact1: number = 9087654321;
  public chosenContact2: number = 9087654321;
  public contacts3: Contact[] = Array.from(this.contacts1).map(([number, type]) => ({ number, type }));
  public chosenContact3: Contact = this.contacts3[0];
  public contacts4: Contact[] = this.contacts3.slice();
  public chosenContact4: Contact = { number: 123456790, type: 'mobile' };
  public contacts5: Contact[] = this.contacts3.slice();
  public chosenContact5: Contact = { number: 123456790, type: 'mobile' };
  public matcher: (a: Contact, b: Contact) => boolean = (a: Contact, b: Contact) => a.type === b.type && a.number === b.number;
  public contacts6: string[] = this.contacts5.map(({ number, type }) => `${number}-${type}`);
  public chosenContact6: string = this.contacts6[0];
  public contacts7: string[] = this.contacts6.slice();
  public chosenContact7: string = this.contacts7[0];
  public likesCake: boolean;
  public noDisplayValue: string = "Don't care";
  public trueValue: string = 'Yes';
  public falseValue: string = 'No';

  public hasAgreed: boolean;

  public products1: Product[] = [{ id: 0, name: 'Motherboard' }, { id: 1, name: 'CPU' }, { id: 2, name: 'Memory' }];
  public chosenProducts1: Product[] = [this.products1[0]];
  public products2: Product[] = this.products1.slice();
  public chosenProducts2: Product[] = [{ id: 0, name: 'Motherboard' }];
  public productMatcher: (a: Product, b: Product) => boolean = (a, b) => a.id === b.id && a.name === b.name;
  // #endregion

  public somethingDone: boolean = false;

  // #region select
  public items1: SelectOption[] = [{ id: 0, displayText: 'Motherboard' }, { id: 1, displayText: 'CPU' }, { id: 2, displayText: 'Memory' }];
  public selectedItem1: number = 0;
  public items2: SelectOption[] = this.items1.map(({ id, displayText: name }) => ({ id: { id, name }, displayText: name }));
  public selectedItem2: Item = this.items2[0].id;
  public items3: SelectOption[] = this.items2.slice();
  public selectedItem3: Item = { id: 0, name: 'Motherboard' };
  public optionMatcher: (a: Item, b: Item) => boolean = (a, b) => !!a && !!b && a.id === b.id;
  public items4: SelectOption[] = this.items1.map(({ id, displayText }) => ({ id: id.toString(), displayText }));
  public selectedItem4: Item = this.items4[0].id;

  public selectedItems1: number[] = [0];
  public selectedItems2: Item[] = [this.items2[0].id];
  public selectedItems3: Item[] = [{ id: 0, name: 'Motherboard' }];
  public selectedItems4: Item[] = [this.items4[0].id];
  // #endregion

  public changeTexts() {
    this.text1 = 'newText1';
    this.text2 = 'newText2';
    this.text3 = 'newText3';
  }

  public doSomething() {
    this.somethingDone = true;
  }
}
