// Promise polyfill for old browsers
import 'promise-polyfill/lib/polyfill';
import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';
import { HomeComponent } from './components/home/home-component';
import { Registration } from '@aurelia/kernel';
import { ViewportCustomElement, NavCustomElement } from '@aurelia/router';
import { HeaderLayout } from './shared/layouts/header-layout';
import { FooterLayout } from './shared/layouts/footer-layout';
import { FavoriteButton } from './shared/buttons/favorite-button';
import { FollowButton } from './shared/buttons/follow-button';
import { ArticleList } from './resources/elements/article-list';
import { ArticlePreview } from './resources/elements/article-preview';
import { ProfileComponent } from './components/profile/profile-component';
import { EditorComponent } from './components/editor/editor-component';
import { AuthComponent } from './components/auth/auth-component';
import { DateValueConverter } from './resources/value-converters/date';
import { FormatHtmlValueConverter } from './resources/value-converters/format-html';
import { KeysValueConverter } from './resources/value-converters/keys';
import { SharedState } from './shared/state/shared-state';
import { ProfileArticleComponent } from './components/profile/profile-article-component';
import { ProfileFavoritesComponent } from './components/profile/profile-favorites-component';
import { CommentCustomElement } from './components/article/comment';
import { ArticleComponent } from './components/article/article-component';
import { MarkdownHtmlValueConverter } from './resources/value-converters/markdown-html';

const container =
  BasicConfiguration.createContainer().register(
    App,
    ViewportCustomElement,
    HomeComponent,
    HeaderLayout,
    FooterLayout,
    FavoriteButton,
    FollowButton,
    ArticleList,
    ArticlePreview,
    ArticleComponent,
    ProfileComponent,
    EditorComponent,
    AuthComponent,
    DateValueConverter,
    FormatHtmlValueConverter,
    KeysValueConverter,
    SharedState,
    ProfileArticleComponent,
    ProfileFavoritesComponent,
    CommentCustomElement,
    MarkdownHtmlValueConverter
  );


global['au'] = new Aurelia(container)
  .register(BasicConfiguration, DebugConfiguration)
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();
