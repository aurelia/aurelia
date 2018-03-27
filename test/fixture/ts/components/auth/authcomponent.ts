import { autoinject } from "aurelia-dependency-injection";
import { activationStrategy, RouteConfig, Router } from "aurelia-router";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class AuthComponent {
  // tslint:disable-next-line:no-reserved-keywords
  public type: string = "";
  public username: string = "";
  public email: string = "";
  public password: string = "";
  public errors: any[] = [];

  public userService: UserService;
  public sharedState: SharedState;
  public router: Router;
  public controller: ValidationController;

  constructor(
    userService: UserService,
    sharedState: SharedState,
    router: Router,
    controllerFactory: ValidationControllerFactory
  ) {
    this.userService = userService;
    this.sharedState = sharedState;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();

    ValidationRules.ensure("email")
      .required()
      .email()
      .ensure("password")
      .required()
      .minLength(8)
      .ensure("username")
      .required()
      .when((auth: any) => auth.type === "register")
      .on(this);
  }

  public determineActivationStrategy(): string {
    return activationStrategy.replace;
  }

  public activate(_params: any, routeConfig: RouteConfig): void {
    this.type = routeConfig.name || "";
  }

  public get canSave(): boolean {
    if (this.type === "login") {
      return this.email !== "" && this.password !== "";
    } else {
      return this.username !== "" && this.email !== "" && this.password !== "";
    }
  }

  public submit(): void {
    this.errors = [];

    this.controller.validate().then(result => {
      if (result.valid) {
        const credentials = {
          username: this.username,
          email: this.email,
          password: this.password
        };
        this.userService
          .attemptAuth(this.type, credentials)
          .then(_data => this.router.navigateToRoute("home"))
          .catch(promise => {
            promise.then((err: any) => (this.errors = err.errors));
          });
      }
    });
  }
}
