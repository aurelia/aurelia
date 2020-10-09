import { DebugConfiguration } from '@aurelia/debug';
import { RuntimeHtmlBrowserConfiguration } from '@aurelia/runtime-html-browser';
import { RouterConfiguration } from '@aurelia/router';
import { Aurelia } from '@aurelia/runtime';

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

(async function () {
  const au = new Aurelia()
    .register(
      State,

      About,
      AboutAuthors,
      AboutBooks,
      Author,
      AuthorDetails,
      Authors,
      Book,
      BookDetails,
      Books,

      Chat,
      ChatUser,
      ChatUsers,

      Login,
      LoginSpecial,
      Main,

      RuntimeHtmlBrowserConfiguration,
      RouterConfiguration.customize({ useHref: true }),
      DebugConfiguration,
    )
    .app({
      host: document.querySelector('app'),
      component: App,
    });

  await au.start().wait();
})().catch(console.error);
