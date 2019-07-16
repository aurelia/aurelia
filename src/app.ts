import { customElement, IViewModel, LifecycleFlags } from '@aurelia/runtime';
import template from './app.html';
import { Router } from '@aurelia/router';
import { inject, PLATFORM } from '@aurelia/kernel';
import { UserService } from './shared/services/user-service';
import { SharedState } from './shared/state/shared-state';

@customElement({ name: 'app', template })
@inject(Router, UserService)
export class App implements IViewModel {
  message: string;

  constructor(private readonly router: Router, private readonly userService: UserService) {
    this.message = 'Hello World!'; // just for unit testing ;)
  }

  public bound() {
    this.router.activate();

    // Yeah, this is cheating somewhat, should've reacted to actual count
    this.router.setNav('root',
      [
        {
          route: [
            {}
          ], title: 'Home',
        }
      ]
      // { route: ['', 'home'], moduleId: './components/home/home-component', name: 'home', title: 'Home' },
      // { route: ['login'], moduleId: './components/auth/auth-component', name: 'login', title: 'Sign in' },
      // { route: ['register'], moduleId: './components/auth/auth-component', name: 'register', title: 'Sign up' },
      // { route: ['settings'], moduleId: './components/settings/settings-component', name: 'settings', title: 'Settings', settings: { auth: true } },
      // { route: [':name'], moduleId: './components/profile/profile-component', name: 'profile', title: 'Profile' },
      // { route: ['editor/:slug?'], moduleId: './components/editor/editor-component', name: 'editor', title: 'Editor', settings: { auth: true } },
      // { route: ['article/:slug'], moduleId: './components/article/article-component', name: 'article', title: 'article' }
    );
  }

  binding() {
    this.userService.populate();
  }
}




@inject(SharedState)
export class AuthorizeStep {
  state: any;

  constructor(state) {
    this.state = state;
  }

  run(navigationInstruction, next) {
    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
      const isLoggedIn = this.state.isAuthenticated;
      if (!isLoggedIn) {
        return next.cancel(new Redirect('login'));
      }
    }

    return next();
  }
}
