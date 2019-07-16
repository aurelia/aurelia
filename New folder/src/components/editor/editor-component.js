import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router'
import {ArticleService} from "../../shared/services/article-service";

@inject(ArticleService, Router)
export class EditorComponent {
  article;
  @observable() tag;

  constructor(as, r) {
    this.articleService = as;
    this.router = r;
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;
    this.slug = params.slug;

    if (this.slug) {
      return this.articleService.get(this.slug)
        .then(article => {
          this.article = article;
        });
    } else {
      this .article = {
        title: '',
        description: '',
        body: '',
        tagList: []
      };
    }
    return null;
}

  tagChanged(newValue, oldValue) {
    if (newValue !== undefined && newValue !== '')
      this.addTag(this.tag);
  }

  addTag(tag) {
    this.article.tagList.push(tag);
  }

  removeTag(tag) {
    this.article.tagList.splice(this.article.tagList.indexOf(tag), 1);
  }

  publishArticle() {
    this.articleService.save(this.article)
      .then((article) => {
        this.slug = article.slug;
        this.router.navigateToRoute('article', {slug: this.slug})
      })
  }
}
