import {inject} from 'aurelia-dependency-injection';
import {UserService} from './shared/services/userservice';

@inject(UserService)
export class App {
  
  constructor(userService) {
    this.message = 'Hello World!'; // just for unit testing ;)
    this.userService = userService;
  }
  
  configureRouter(config, router) {
    config.title = 'Conduit';
    config.map([
      {route: ['', 'home'], moduleId: 'components/home/homecomponent', name: 'home', title: 'Home'},
      {route: ['login'], moduleId: 'components/auth/authcomponent', name: 'login', title: 'Sign in'},
      {route: ['register'], moduleId: 'components/auth/authcomponent', name:'register', title: 'Sign up'},
      {route: ['settings'], moduleId: 'components/settings/settingscomponent', name:'settings', title: 'Settings'},
      {route: [':name'], moduleId: 'components/profile/profilecomponent', name:'profile', title: 'Profile'},
      {route: ['editor/:slug?'], moduleId: 'components/editor/editorcomponent', name:'editor', title: 'Editor'},
      {route: ['article/:slug'], moduleId: 'components/article/articlecomponent', name:'article', title: 'article'}
    ]);
    
    this.router = router;
  }
  
  attached() {
    this.userService.populate();
  }
}
