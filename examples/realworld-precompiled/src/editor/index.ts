import { customElement, IRouteViewModel, Params, IRouter } from 'aurelia';
import { watch } from '@aurelia/runtime-html';
import { AuthHandler, IArticleState } from '../state';
import { Article } from '../api';
import { h, queue } from '../util';

@customElement({
  name: 'editor-view',
  needsCompile: false,
  dependencies: [AuthHandler],
  template: `<div class="editor-page"><div class="container page"><div class="row"><div class="col-md-10 offset-md-1 col-xs-12"><error-list class="au"></error-list><form class="au"><fieldset><fieldset class="form-group"><input type="text" class="form-control form-control-lg au" placeholder="Article Title" name="title"></fieldset><fieldset class="form-group"><input type="text" class="form-control au" placeholder="What\'s this article about?" name="description"></fieldset><fieldset class="form-group"><textarea class="form-control au" rows="8" placeholder="Write your article (in markdown)" name="body"></textarea></fieldset><fieldset class="form-group"><input type="text" class="form-control au" placeholder="Enter tags" name="tag"><div class="tag-list"><!--au-start--><!--au-end--><au-m class="au"></au-m></div></fieldset><button class="btn btn-lg pull-xs-right btn-primary au" type="button" data-e2e="saveBtn">Publish Article</button></fieldset></form></div></div></div></div>`,
  instructions: [[
    h.element('error-list', false, [
      h.bindProp('$article.errors', 'errors', 2),
    ]),
  ], [
    h.bindListener('$event.preventDefault()', 'submit', true, false),
  ], [
    h.bindProp('local.title', 'value', 6),
  ], [
    h.bindProp('local.description', 'value', 6),
  ], [
    h.bindProp('local.body', 'value', 6),
  ], [
    h.bindProp('tag', 'value', 6),
    h.bindListener('onTagKeyUp($event,tag)', 'keyup', true, false),
  ], [
    h.templateCtrl('repeat', [h.bindIterator('tag of local.tagList', 'items', [])], {
      template: `<span class="tag-default tag-pill au"><i class="ion-close-round au" data-e2e="removeTagBtn"></i><!--au-start--><!--au-end--><au-m class="au"></au-m></span>`,
      instructions: [[
        h.interpolation('${tag-tag}', 'data-e2e'),
      ], [
        h.bindListener('removeTag($index)', 'click', true, false),
      ], [
        h.bindText('tag', false),
      ]],
    }),
  ], [
    h.bindListener('save()', 'click', true, false),
  ]],
})
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

