import template from './index.html';

import { customElement, IRouteViewModel, Params, watch, IRouter } from 'aurelia';
import { AuthHandler, IArticleState } from '../state';
import { Article } from '../api';
import { queue } from '../util';

@customElement({ name: 'editor-view', template, dependencies: [AuthHandler] })
export class EditorViewCustomElement implements IRouteViewModel {
  local: Article;

  tag = '';

  constructor(
    @IRouter readonly router: IRouter,
    @IArticleState readonly $article: IArticleState,
  ) {
    this.local = $article.current.clone();
  }

  async loading({ slug }: Params) {
    await this.$article.load(slug);
  }

  @watch<EditorViewCustomElement>(x => x.$article.current)
  sync() {
    this.local = this.$article.current.clone();
  }

  onTagKeyUp(e: KeyboardEvent, tag: string) {
    if (e.key === 'Enter' && tag.length > 0) {
      this.local.tagList.push(tag);
      this.tag = '';
    }
  }

  removeTag(index: number) {
    this.local.tagList.splice(index, 1);
  }

  @queue async save() {
    if (await this.$article.save(this.local)) {
      await this.router.load(`article/${this.$article.current.slug}`);
    }
  }
}
