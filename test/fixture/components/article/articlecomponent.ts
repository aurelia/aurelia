import { computedFrom } from "aurelia-binding";
import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig, Router } from "aurelia-router";
import { ArticleService } from "../../shared/services/articleservice";
import { CommentService } from "../../shared/services/commentservice";
import { ProfileService } from "../../shared/services/profileservice";
import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class ArticleComponent {
  public article: any;
  public comments: any[] = [];
  public myComment: any;

  public articleService: ArticleService;
  public commentService: CommentService;
  public userService: UserService;
  public sharedState: SharedState;
  public profileService: ProfileService;
  public router: Router;

  public routeConfig: RouteConfig | undefined;
  public slug: string = "";

  constructor(
    articleService: ArticleService,
    commentService: CommentService,
    userService: UserService,
    sharedState: SharedState,
    profileService: ProfileService,
    router: Router
  ) {
    this.articleService = articleService;
    this.commentService = commentService;
    this.userService = userService;
    this.sharedState = sharedState;
    this.profileService = profileService;
    this.router = router;
  }

  public activate(params: any, routeConfig: RouteConfig): Promise<void> {
    this.routeConfig = routeConfig;
    this.slug = params.slug;

    return this.articleService.get(this.slug).then(article => {
      this.article = article;
      this.commentService.getList(this.slug).then(comments => (this.comments = comments));
    });
  }

  public onToggleFavorited(): void {
    this.article.favorited = !this.article.favorited;
    if (this.article.favorited) {
      this.article.favoritesCount++;
      this.articleService.favorite(this.slug);
    } else {
      this.article.favoritesCount--;
      this.articleService.unfavorite(this.slug);
    }
  }

  public onToggleFollowing(): void {
    this.article.author.following = !this.article.author.following;
    if (this.article.author.following) {
      this.profileService.follow(this.article.author.username);
    } else {
      this.profileService.unfollow(this.article.author.username);
    }
  }

  public postComment(): Promise<void> {
    return this.commentService.add(this.slug, this.myComment).then(comment => {
      this.comments.push(comment);
      this.myComment = "";
    });
  }

  @computedFrom("article.author.username")
  public get canModify(): boolean {
    return this.article.author.username === this.sharedState.currentUser.username;
  }

  public deleteArticle(): void {
    this.articleService.destroy(this.article.slug).then(() => this.router.navigateToRoute("home"));
  }

  public deleteComment(commentId: string): void {
    this.commentService.destroy(commentId, this.slug).then(() => {
      this.commentService.getList(this.slug).then(comments => (this.comments = comments));
    });
  }
}
