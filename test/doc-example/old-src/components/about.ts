import { customElement } from '@aurelia/runtime-html';
import { IRouter } from 'aurelia-direct-router';
import { State } from '../state';

@customElement({
  name: 'about',
  template: `
    <h3>Basic routing example: authors and books</h3>
    <p>This application lists authors and books and shows their details.</p>
    <p>This About component is displayed at application start and when navigating to Authors or Books lists in the navbar above.</p>
    <p style="color: blue;">Scroll the text below and type something in the input. Then select an <i>author</i> and after that navigate to About. Select an <i>author</i> again and type into and scroll the contents of the tabs. Also: Write different things in the different chat inputs and switch between them.</p>
    <p style="color: blue;">The viewports <strong>content</strong>, <strong>author-tabs</strong> and <strong>chat-details</strong> are all <strong>stateful</strong>.</p>
    <div style="height: 200px; overflow: auto;" id="scrolled">
      <pre>
        Scroll me to the moon
        Let me play among the stars
        Let me see what spring is like
        On a-Jupiter and Mars
        In other words, hold my hand
        In other words, baby, kiss me
        Fill my heart with song and
        Let me sing forever more
        You are all I long for
        All I worship and adore
        In other words, please be true
        In other words, I scroll you
        Fill my heart with song
        Let me sing forever more
        You are all I long for
        All I worship and I adore
        In other words, please be true
        In other words
        In other words, I scroll you
      </pre>
    </div>
    <br>
    <input data-test="about-inputbox">
  `
})
export class About {
  public constructor(
    private readonly state: State,
    @IRouter private readonly router: IRouter,
  ) {}

  public async enter() {
    if (!this.state.noDelay) {
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }

  public async goClick(suppress) {
    // await this.router.historyBrowser.history.pushState('books', null, '#books');
    // // eslint-disable-next-line no-console
    // console.log('books', this.router.historyBrowser.history.history.state);
    // await this.router.historyBrowser.history.pushState('two', null, '#two');
    // // eslint-disable-next-line no-console
    // console.log('two', this.router.historyBrowser.history.history.state);
    // await this.router.historyBrowser.history.go(-1, suppress);
    // // eslint-disable-next-line no-console
    // console.log('books', this.router.historyBrowser.history.history.state);
  }
}
