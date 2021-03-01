import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { RouterConfiguration } from '@aurelia/router';
import { MyApp } from './my-app';

import * as Welcome from './main/welcome';
import * as About from './main/about';
import { Missing } from './main/missing';
import { Login } from './main/login';
import { Profile } from './main/profile';
import * as Contact from './main/contact';
import { Books } from './books/books';
import { BookDetails } from './books/book-details';

const globals = [
  Welcome,
  About,
  Missing,
  Login,
  Profile,
  Contact,
  Books,
  BookDetails,
];

const au = new Aurelia()
  .register(
    StandardConfiguration,
    RouterConfiguration.customize({ useUrlFragmentHash: false }),
    ...globals,
  );

au.app({
  host: document.querySelector('app') as HTMLElement,
  component: MyApp
});
au.start();
