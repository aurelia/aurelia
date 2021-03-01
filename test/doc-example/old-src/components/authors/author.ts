import { IRouter } from '@aurelia/router';
import { customElement, INode } from '@aurelia/runtime-html';
import { AuthorsRepository } from '../../repositories/authors';
import { State } from '../../state';
import { Information } from './information';

@customElement({
  name: 'author',
  template: `
    <h3 data-test="author-element-author-name">\${author.name}</h3>
    <div data-test="author-element-birth-year">Born: \${author.born}</div>
    <div>Books:
      <ul>
        <li repeat.for="book of author.books"><a data-test="author-element-book-link" href="book(\${book.id})">\${book.title}</a></li>
      </ul>
    </div>
    <div class="info">
      <label><input type="checkbox" data-test="author-element-hide-tabs-checkbox" checked.two-way="hideTabs">Hide author tabs (adds/removes with an <strong>if</strong>)</label><br>
    </div>
    <div class="info">
      <a goto="authors">Authors</a>
    </div>
    <div if.bind="!hideTabs">
      <au-nav data-test="author-menu" name="author-menu"></au-nav>
      <au-viewport no-scope name="author-tabs" default="author-details(\${author.id})" used-by="about-authors,author-details,information,login-special" no-history></au-viewport>
    </div>
  `,
  dependencies: [
    Information,
  ],
})
export class Author {
  public static parameters: string[] = ['id'];

  public author: { id: number };

  public hideTabs: boolean = false;

  public constructor(
    @IRouter private readonly router: IRouter,
    private readonly authorsRepository: AuthorsRepository,
    private readonly state: State,
  ) {}

  public define() {
    console.log('### define', this);
  }

  public hydrating() {
    console.log('### hydrating', this);
  }

  public hydrated() {
    console.log('### hydrated', this);
  }

  public created() {
    console.log('### created', this);
  }

  // KEEP THIS!
  public match(current) {
    // const rootScope = this.router['rootScope'];

    // const match = rootScope.routeTable.findMatchingRoute(current.path);
    // console.log('matching route', match);
  }

  public canEnter(parameters) {
    console.log('### canEnter', this, parameters);
    return true;
  }
  public async enter(parameters) {
    console.log('### enter', this, parameters);
    this.author = this.authorsRepository.author(+parameters.id);
    this.router.setNav('author-menu', [
      { title: '<strong>Details</strong>', route: `author-details(${this.author.id})` },
      { title: 'About authors', route: 'about-authors' },
      { title: 'Author information', route: 'information' },
    ]);
    // const vp = this.router.getViewport('author-tabs');
    // const component = vp && vp.content && vp.content.toComponentName();
    // if (component) {
    //   this.router.goto(component + (component === 'author-details' ? `(${this.author.id})` : '')).catch(err => { throw err; });
    // }
    if (!this.state.noDelay) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  public binding() {
    console.log('### binding', this);
    const newRoutes = this.router.addRoutes([
      { path: 'awards', instructions: [{ component: 'awards', viewport: 'down' }] },
      { path: '/new', instructions: [{ component: 'new', viewport: 'right' }] },
      { path: 'authors', instructions: [{ component: 'about-authors', viewport: 'author-tabs' }] },
    ], this);
    console.log('routes', newRoutes);

    // const instructions = 'authors@left/author(1)@down+about@middle+new@right/new@right';
    // const path = 'authors/1+about+new/new';
    // const route = {
    //   path,
    //   instructions: this.router.instructionResolver.parseViewportInstructions(instructions)
    // };
    // console.log('route', route);
    // this.match(route);
  }
  public bound() {
    console.log('### bound', this);
  }
  public attaching() {
    console.log('### attaching', this);
  }
  public attached() {
    console.log('### attached', this);
  }

  public canLeave(parameters) {
    console.log('### canLeave', this, parameters);
    return true;
  }
  public leave(parameters) {
    console.log('### leave', this, parameters);
    return true;
  }
  public detaching() {
    console.log('### detaching', this);
  }
  public unbinding() {
    console.log('### unbinding', this);
  }
}
