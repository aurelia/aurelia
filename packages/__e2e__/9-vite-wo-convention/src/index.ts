import Aurelia from 'aurelia';
import { App } from './app';
import { IdentityValueConverter } from './identity';
import { MyInput } from './components/my-input';
import { MyText } from './components/my-text';
import { To42ValueConverter } from './components/to-42-vc';

void Aurelia
.register(
  IdentityValueConverter,
  MyInput,
  MyText,
  To42ValueConverter
)
.app(App)
.start();
