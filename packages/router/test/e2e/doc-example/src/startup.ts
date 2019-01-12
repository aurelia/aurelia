import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, IDOM } from '@aurelia/runtime';

import { NavCustomElement, ViewportCustomElement } from '../../../../../router/src/index';
import { App } from './app';

import { About } from './components/about';
import { AboutAuthors } from './components/about-authors';
import { AboutBooks } from './components/about-books';
import { Author } from './components/author';
import { AuthorDetails } from './components/author-details';
import { Authors } from './components/authors';
import { Book } from './components/book';
import { BookDetails } from './components/book-details';
import { Books } from './components/books';

import { Chat } from './components/chat';
import { ChatUser } from './components/chat-user';
import { ChatUsers } from './components/chat-users';

const container = BasicConfiguration.createContainer();

container.register(
  ViewportCustomElement as any,
  NavCustomElement as any,
  App as any,

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
);

window['au'] = new Aurelia(container)
  .register(DebugConfiguration)
  .app({ host: document.querySelector('app'), component: App })
  .start();
