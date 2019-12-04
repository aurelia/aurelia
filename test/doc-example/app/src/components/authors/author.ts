import { IRouter } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';
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

  public created() {
    console.log('### created', this);
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
    const vp = this.router.getViewport('author-tabs');
    const component = vp && vp.content && vp.content.toComponentName();
    if (component) {
      this.router.goto(component + (component === 'author-details' ? `(${this.author.id})` : '')).catch(err => { throw err; });
    }
    if (!this.state.noDelay) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  public beforeBind() {
    console.log('### binding', this);
  }
  public afterBind() {
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
  public detached() {
    console.log('### detached', this);
  }
  public unbinding() {
    console.log('### unbinding', this);
  }
  public unbound() {
    console.log('### unbound', this);
  }
}
