import { observable } from "aurelia-binding";
import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig, Router } from "aurelia-router";
import { ArticleService } from "../../shared/services/articleservice";

@autoinject()
export class EditorComponent {
  public article: any;

  @observable()
  public tag: string | undefined;

  public articleService: ArticleService;
  public router: Router;

  public routeConfig: RouteConfig | undefined;
  public slug: string | undefined;

  constructor(articleService: ArticleService, router: Router) {
    this.articleService = articleService;
    this.router = router;
  }

  public activate(params: any, routeConfig: RouteConfig): Promise<any> {
    this.routeConfig = routeConfig;
    this.slug = params.slug;

    if (this.slug) {
      return this.articleService.get(this.slug).then(article => {
        this.article = article;
      });
    } else {
      this.article = {
        title: "",
        description: "",
        body: "",
        tagList: []
      };
    }

    return Promise.resolve(null);
  }

  public tagChanged(newValue: string | undefined, _oldValue: string | undefined): void {
    if (newValue !== undefined && newValue !== "") {
      this.addTag(newValue);
    }
  }

  public addTag(tag: string): void {
    this.article.tagList.push(tag);
  }

  public removeTag(tag: string): void {
    this.article.tagList.splice(this.article.tagList.indexOf(tag), 1);
  }

  public publishArticle(): void {
    this.articleService.save(this.article).then(article => {
      this.slug = article.slug;
      this.router.navigateToRoute("article", { slug: this.slug });
    });
  }
}
