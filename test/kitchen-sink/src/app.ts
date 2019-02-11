import {startFPSMonitor, startMemMonitor, initProfiler, startProfile, endProfile} from 'perf-monitor';
import * as faker from 'faker';
import './app.scss';
import './extensions';

import { customElement, ICustomElement, IDOM, CustomElementResource, buildTemplateDefinition, IteratorBindingInstruction, HydrateTemplateController, InterpolationInstruction, bindable, BindingStrategy } from '@aurelia/runtime';
import { Subject, createElement, TextBindingInstruction } from '@aurelia/runtime-html'

startFPSMonitor();
startMemMonitor();

import template from './app.html';
import { ComboBox } from './elements/combo-box';
import { teamNames, fantasyRaceNames } from './models/team';

function createItem() {
  return {
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    country: faker.address.country()
  };
}

export interface App extends ICustomElement<HTMLElement> {}

@customElement({
  name: 'app',
  template,
  dependencies: [ComboBox]
})
export class App {
  public rows: any[];
  public cols: string[];
  public subject: Subject;

  @bindable public keyedStrategy: boolean;
  @bindable public patchStrategy: boolean;
  @bindable public proxyStrategy: boolean;

  public route: number;

  constructor() {
    this.route = 1;
    this.rows = [];
    this.cols = ['name', 'phone', 'country'];
  }

  public created(): void {
    this.$host.textContent = '';
    this.createSubject();
  }

  public generateMembers() {
    let items = [];
    for (let i = 0; teamNames.length > i; ++i) {
      let member = teamNames[i];
      items[i] = {
        id: member.id,
        name: member.name + ' the ' + fantasyRaceNames.rand(),
        url: member.url,
        level: Math.floor(Math.random() * 99)
      }
    }
    return items;
  }

  public create(count: number): void {
    for (let i = 0; i < count; ++i) {
      this.rows.push(createItem());
    }
  }

  public clear(): void {
    this.rows = [];
  }

  private createSubject(): void {
    let strategy: BindingStrategy;
    if (this.keyedStrategy) {
      strategy |= BindingStrategy.keyed;
    }
    if (this.proxyStrategy) {
      strategy |= BindingStrategy.proxies;
    }
    if (this.patchStrategy) {
      strategy |= BindingStrategy.patch;
    }
    const dom = this.$context.get<IDOM<Node>>(IDOM);
    this.subject = createElement<Node>(dom, 'table', {
      class: 'table is-fullwidth',
    }, [
      createElement<Node>(dom, 'thead', {}, [
        createElement<Node>(dom, 'tr', {
          $1: new HydrateTemplateController({
              name: '',
              template: '<th><au-m class="au"></au-m> </th>',
              instructions: [[new TextBindingInstruction('${col | pascal}')]],
              strategy
            },
            'repeat',
            [new IteratorBindingInstruction(this.keyedStrategy ? 'col of cols & keyed' : 'col of cols', 'items')]
          )
        })
      ]),
      createElement<Node>(dom, 'tbody', {
        $1: new HydrateTemplateController({
            name: '',
            template: '<tr><au-m class="au"></au-m></tr>',
            instructions: [[new HydrateTemplateController({
                name: '',
                template: '<td><au-m class="au"></au-m> </td>',
                instructions: [[new TextBindingInstruction('${row[col]}')]],
                strategy
              },
              'repeat',
              [new IteratorBindingInstruction(this.keyedStrategy ? 'col of cols & keyed' : 'col of cols', 'items')]
            )]]
          },
          'repeat',
          [new IteratorBindingInstruction(this.keyedStrategy ? 'row of rows & keyed' : 'row of rows', 'items')]
        )
      })
    ]);
  }

  protected keyedModeChanged(): void {
    this.createSubject();
  }

  protected patchModeChanged(): void {
    this.createSubject();
  }

  protected proxyModeChanged(): void {
    this.createSubject();
  }
}
