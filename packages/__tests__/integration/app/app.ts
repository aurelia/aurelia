import { customElement } from '@aurelia/runtime';
import template from './app.html';

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

  public changeTexts() {
    this.text1 = 'newText1';
    this.text2 = 'newText2';
    this.text3 = 'newText3';
  }
}
