import template from './index.html';

import { customElement, IRouteViewModel, Params, IPlatform, watch, IRouter } from 'aurelia';
import { AuthHandler, IArticleState } from '../state';
import { Article } from '../api';

@customElement({ name: 'editor-view', template, dependencies: [AuthHandler] })
export class EditorViewCustomElement implements IRouteViewModel {
  local: Article;
  dirty = false;
  get busy(): boolean { return this.$article.loadPending || this.$article.savePending; }

  tag = '';

  constructor(
    @IPlatform readonly p: IPlatform,
    @IRouter readonly router: IRouter,
    @IArticleState readonly $article: IArticleState,
  ) {
    this.local = $article.current.clone();
  }

  loading({ slug }: Params): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$article.load(slug);
    });
  }

  @watch<EditorViewCustomElement>(x => x.$article.current)
  sync(): void {
    this.local = this.$article.current.clone();
  }

  @watch<EditorViewCustomElement>(x => !x.local.equals(x.$article.current))
  setDirty(dirty: boolean): void {
    this.dirty = dirty;
  }

  onTagKeyUp(e: KeyboardEvent, tag: string): void {
    if (e.key === 'Enter' && tag.length > 0) {
      this.local.tagList.push(tag);
      this.tag = '';
    }
  }

  removeTag(index: number): void {
    this.local.tagList.splice(index, 1);
  }

  save(): void {
    this.p.taskQueue.queueTask(async () => {
      if (await this.$article.save(this.local)) {
        await this.router.load(`article/${this.$article.current.slug}`);
      }
    });
  }
}
