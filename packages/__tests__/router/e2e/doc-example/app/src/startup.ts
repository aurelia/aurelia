import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { RouterConfiguration } from '@aurelia/router';
import { registerComponent } from './utils';

import { App } from './app';

import { About } from './components/about';
import { AboutAuthors } from './components/authors/about-authors';
import { Author } from './components/authors/author';
import { AuthorDetails } from './components/authors/author-details';
import { Authors } from './components/authors/authors';
import { AboutBooks } from './components/books/about-books';
import { Book } from './components/books/book';
import { BookDetails } from './components/books/book-details';
import { Books } from './components/books/books';

import { Chat } from './components/chat/chat';
import { ChatUser } from './components/chat/chat-user';
import { ChatUsers } from './components/chat/chat-users';
import { Login } from './components/login';
import { LoginSpecial } from './components/login-special';
import { Main } from './components/main';
import { State } from './state';

const container = JitHtmlBrowserConfiguration.createContainer();

container.register(
  App as any,
  State as any,
);
registerComponent(
  container,
  About as any,
  AboutAuthors as any,
  AboutBooks as any,
  Author as any,
  AuthorDetails as any,
  Authors as any,
  Book as any,
  BookDetails as any,
  Books as any,

  Chat as any,
  ChatUser as any,
  ChatUsers as any,

  Login as any,
  LoginSpecial as any,
  Main as any,
);

window['au'] = new Aurelia(container)
  .register(DebugConfiguration, RouterConfiguration)
  .app({ host: document.querySelector('app'), component: App })
  .start();
