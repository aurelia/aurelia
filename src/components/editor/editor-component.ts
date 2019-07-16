import { ArticleService } from "../../shared/services/article-service";
import { inject } from "@aurelia/kernel";
import { Router } from "@aurelia/router";
import { observes, bindable } from "@aurelia/runtime";

export type Article = {
  title?: string;
  description?: string;
  body?: string;
  tagList?: any;
  slug?: string;
};

@inject(ArticleService, Router)
export class EditorComponent {
  article: Article;
  @bindable() tag: any;
  routeConfig: any;
  slug: any;

  constructor(private readonly articleService: ArticleService, private readonly router: Router) {
  }

  activate(params: { slug: any; }, routeConfig: any) {
    this.routeConfig = routeConfig;
    this.slug = params.slug;

    if (this.slug) {
      return this.articleService.get(this.slug)
        .then(article => {
          this.article = article;
        });
    } else {
      this.article = {
        title: '',
        description: '',
        body: '',
        tagList: []
      };
    }
    return null;
  }

  tagChanged(newValue: string, oldValue: any) {
    if (newValue !== undefined && newValue !== '')
      this.addTag(this.tag);
  }

  addTag(tag: any) {
    this.article.tagList.push(tag);
  }

  removeTag(tag: any) {
    this.article.tagList.splice(this.article.tagList.indexOf(tag), 1);
  }

  publishArticle() {
    this.articleService.save(this.article)
      .then((article) => {
        this.slug = article.slug;
        this.router.goto('article', null, { slug: this.slug })
      })
  }
}
