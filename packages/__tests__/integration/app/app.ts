import { customElement } from '@aurelia/runtime';
import template from './app.html';
import { Camera, Zoom } from './molecules/specs-viewer/camera-specs-viewer';
import { Laptop, Storage } from './molecules/specs-viewer/laptop-specs-viewer';
import { User } from './molecules/user-preference/user-preference';

@customElement({ name: 'app', template })
export class App {

  private text1 = 'text1';
  private text2 = 'text2';
  private text3 = 'text3';

  public inputOneTime = 'input1';
  public inputTwoWay = 'input2';
  public inputToView = 'input3';
  public inputFromView = 'input4';
  public inputBlrTw = 'input5';
  public inputBlrFv = 'input6';

  public things = [
    new Camera(new Zoom(40, 4), [125, 1600, 3200, 6400], [4, 16], [3, 6.5], "Coolpix B500", "Nikon"),
    new Laptop("Core i5 3.40 GHz", "8GB DDR4", new Storage("SSD", 1, "TB"), "14 inch", "T460", "Lenovo"),
  ];

  public user = new User('John', 'Doe', 0.1);

  public changeTexts() {
    this.text1 = 'newText1';
    this.text2 = 'newText2';
    this.text3 = 'newText3';
  }
}
