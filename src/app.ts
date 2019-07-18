import { customElement, IViewModel, LifecycleFlags } from '@aurelia/runtime';
import template from './app.html';
import { Router, ViewportInstruction, INavigationInstruction } from '@aurelia/router';
import { inject } from '@aurelia/kernel';
import { UserService } from './shared/services/user-service';
import { SharedState } from './shared/state/shared-state';
import { SettingsComponent } from './components/settings/settings-component';
import { EditorComponent } from './components/editor/editor-component';

@customElement({ name: 'app', template })
@inject(Router, UserService, SharedState)
export class App implements IViewModel {
  message: string;

  constructor(private readonly router: Router, private readonly userService: UserService, private readonly state: SharedState) {
    this.message = 'Hello World!'; // just for unit testing ;)
  }

  public async bound() {
    this.router.guardian.addGuard(
      (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigationInstruction) => {
        if (this.state.isAuthenticated) return true;
        this.router.goto(`auth-component(type=login)`);
        return [];
      }
      , { include: [{ componentName: 'editor-component' }, { componentName: 'settings-component' }] }
    );
    await this.router.activate();

    // Yeah, this is cheating somewhat, should've reacted to actual count
    // this.router.addNav('main',
    //   [
    //     {
    //       components: HomeComponent,
    //       title: 'Home',
    //     },
    //   ]
    // )

    // this.router.setNav('root',
    //   [
    //     {
    //       route: [
    //         {}
    //       ], title: 'Home',
    //     }
    //   ]
    //   // { route: ['', 'home'], moduleId: './components/home/home-component', name: 'home', title: 'Home' },
    //   // { route: ['login'], moduleId: './components/auth/auth-component', name: 'login', title: 'Sign in' },
    //   // { route: ['register'], moduleId: './components/auth/auth-component', name: 'register', title: 'Sign up' },
    //   // { route: ['settings'], moduleId: './components/settings/settings-component', name: 'settings', title: 'Settings', settings: { auth: true } },
    //   // { route: [':name'], moduleId: './components/profile/profile-component', name: 'profile', title: 'Profile' },
    //   // { route: ['editor/:slug?'], moduleId: './components/editor/editor-component', name: 'editor', title: 'Editor', settings: { auth: true } },
    //   // { route: ['article/:slug'], moduleId: './components/article/article-component', name: 'article', title: 'article' }
    // );
  }

  binding() {
    this.userService.populate();
  }
}