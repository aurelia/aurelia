import {startFPSMonitor, startMemMonitor, initProfiler, startProfile, endProfile} from 'perf-monitor';
import * as faker from 'faker';
import './app.scss';

import { customElement, IViewModel, IDOM, CustomElementResource, buildTemplateDefinition, IteratorBindingInstruction, HydrateTemplateController, InterpolationInstruction, bindable, BindingStrategy, IController } from '@aurelia/runtime';
import { Subject, createElement, TextBindingInstruction } from '@aurelia/runtime-html'

startFPSMonitor();
startMemMonitor();

import template from './app.html';

function createItem() {
  return {
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    country: faker.address.country()
  };
}

@customElement({ name: 'app', template })
export class App {
  public rows: any[];
  public cols: string[];
  public subject: Subject;
  @bindable public keyedStrategy: boolean;
  @bindable public proxyStrategy: boolean;

  public $controller: IController<Node>;

  constructor() {
    this.rows = [];
    this.cols = ['name', 'phone', 'country'];
  }


  public created(): void {
    this.$controller.host.textContent = '';
    this.createSubject();
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
    if (this.proxyStrategy) {
      strategy |= BindingStrategy.proxies;
    }
    const dom = this.$controller.context.get<IDOM<Node>>(IDOM);
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
            [new IteratorBindingInstruction(this.keyedStrategy ? 'col of cols' : 'col of cols', 'items')]
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
              [new IteratorBindingInstruction(this.keyedStrategy ? 'col of cols' : 'col of cols', 'items')]
            )]]
          },
          'repeat',
          [new IteratorBindingInstruction(this.keyedStrategy ? 'row of rows' : 'row of rows', 'items')]
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
