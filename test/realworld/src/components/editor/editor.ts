import { inject } from "@aurelia/kernel";
import { IRouter } from "@aurelia/router";
import { bindable, BindingMode } from "@aurelia/runtime";
import { Article } from "shared/models/article";
import { ArticleService } from "shared/services/article-service";

@inject(ArticleService, IRouter)
export class Editor {
  @bindable({ mode: BindingMode.twoWay }) public tag?: string;
  private article?: Article;
  private slug?: string;

  constructor(private readonly articleService: ArticleService, private readonly router: IRouter) {
  }

  public enter(params: { slug: any; }) {
    this.slug = params.slug;

    if (this.slug) {
      return this.articleService.get(this.slug)
        .then((article) => {
          this.article = article;
        });
    } else if (!this.article) {
      this.article = {
        body: '',
        description: '',
        tagList: [],
        title: '',
      };
    }
    return null;
  }

  public tagChanged(newValue: string) {
    if (newValue !== undefined && newValue !== '') {
      this.addTag(this.tag);
    }
  }

  public addTag(tag: any) {
    if (!this.article) { return; }
    if (!this.article.tagList) {
      this.article.tagList = [];
    }

    this.article.tagList.push(tag);
  }

  public removeTag(tag: string) {
    this.article!.tagList!.splice(this.article!.tagList!.indexOf(tag), 1);
  }

  public publishArticle() {
    if (!this.article) { return; }
    this.articleService.save(this.article)
      .then((article) => {
        this.slug = article.slug;
        this.router.goto({ component: 'article', parameters: { slug: this.slug } });
      });
  }
}
