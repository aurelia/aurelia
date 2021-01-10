import { CustomElement, Route, Watch, IRouter } from '../aurelia.js';
import { AuthHandler, IArticleState } from '../state.js';

export const EditorView = CustomElement.define({
  name: 'editor-view',
  template: `
    <div class="editor-page">
      <div class="container page">
        <div class="row">

          <div class="col-md-10 offset-md-1 col-xs-12">
            <error-list errors.bind="$article.errors"></error-list>

            <form submit.trigger="$event.preventDefault()">
              <fieldset>
                <fieldset class="form-group">
                  <input type="text" class="form-control form-control-lg" placeholder="Article Title"
                    value.bind="local.title" name="title">
                </fieldset>
                <fieldset class="form-group">
                  <input type="text" class="form-control" placeholder="What's this article about?"
                    value.bind="local.description" name="description">
                </fieldset>
                <fieldset class="form-group">
                  <textarea class="form-control" rows="8" placeholder="Write your article (in markdown)"
                    value.bind="local.body" name="body"></textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input type="text" class="form-control" placeholder="Enter tags" value.bind="tag"
                    keyup.delegate="onTagKeyUp($event, tag)" name="tag">
                  <div class="tag-list">
                    <span repeat.for="tag of local.tagList" class="tag-default tag-pill" data-e2e="tag-\${tag}">
                      <i class="ion-close-round" click.delegate="removeTag($index)" data-e2e="removeTagBtn"></i>
                      \${tag}
                    </span>
                  </div>
                </fieldset>
                <button class="btn btn-lg pull-xs-right btn-primary" type="button" click.delegate="save()"
                  data-e2e="saveBtn">
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>

        </div>
      </div>
    </div>
  `,
}, class {
  static get inject() { return [IRouter, IArticleState]; }

  constructor(router, $article) {
    this.router = router;
    this.$article = $article;

    this.local = $article.current.clone();
    this.tag = '';
  }

  async load({ slug }) {
    await this.$article.load(slug);
  }

  onTagKeyUp(e, tag) {
    if (e.key === 'Enter' && tag.length > 0) {
      this.local.tagList.push(tag);
      this.tag = '';
    }
  }

  removeTag(index) {
    this.local.tagList.splice(index, 1);
  }

  async save() {
    if (await this.$article.save(this.local)) {
      await this.router.load(`article/${this.$article.current.slug}`);
    }
  }
});

Route.configure({ canLoad: [AuthHandler] }, EditorView);

Watch.add(EditorView, {
  expression: x => x.$article.current,
  callback() {
    this.local = this.$article.current.clone();
  },
})
