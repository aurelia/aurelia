import { autoinject } from "aurelia-dependency-injection";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { UserService } from "./shared/services/userservice";

@autoinject()
export class App {
  public message: string;
  public userService: UserService;

  public router: Router | undefined;

  constructor(userService: UserService) {
    this.message = "Hello World!"; // just for unit testing ;)
    this.userService = userService;
  }

  public configureRouter(config: RouterConfiguration, router: Router): void {
    config.title = "Conduit";
    config.map([
      {
        route: ["", "home"],
        moduleId: PLATFORM.moduleName("components/home/homecomponent"),
        name: "home",
        title: "Home"
      },
      {
        route: ["login"],
        moduleId: PLATFORM.moduleName("components/auth/authcomponent"),
        name: "login",
        title: "Sign in"
      },
      {
        route: ["register"],
        moduleId: PLATFORM.moduleName("components/auth/authcomponent"),
        name: "register",
        title: "Sign up"
      },
      {
        route: ["settings"],
        moduleId: PLATFORM.moduleName("components/settings/settingscomponent"),
        name: "settings",
        title: "Settings"
      },
      {
        route: [":name"],
        moduleId: PLATFORM.moduleName("components/profile/profilecomponent"),
        name: "profile",
        title: "Profile"
      },
      {
        route: ["editor/:slug?"],
        moduleId: PLATFORM.moduleName("components/editor/editorcomponent"),
        name: "editor",
        title: "Editor"
      },
      {
        route: ["article/:slug"],
        moduleId: PLATFORM.moduleName("components/article/articlecomponent"),
        name: "article",
        title: "article"
      }
    ]);

    this.router = router;
  }

  public attached(): void {
    this.userService.populate();
  }
}
