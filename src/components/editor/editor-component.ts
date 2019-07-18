import { inject } from "@aurelia/kernel";
import { Router } from "@aurelia/router";
import { bindable, BindingMode, customElement } from "@aurelia/runtime";
import { Article } from "shared/models/article";
import { ArticleService } from "shared/services/article-service";
import template from './editor-component.html';

@inject(ArticleService, Router)
@customElement({ name: 'editor-component', template })
export class EditorComponent {
  @bindable({ mode: BindingMode.twoWay }) public tag?: string;
  private article?: Article;
  private slug?: string;

  constructor(private readonly articleService: ArticleService, private readonly router: Router) {
  }

  public enter(params: { slug: any; }) {
    this.slug = params.slug;

    if (this.slug) {
      return this.articleService.get(this.slug)
        .then((article) => {
          this.article = article;
        });
    } else {
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
        this.router.goto('article', 'article', { slug: this.slug });
      });
  }
}
