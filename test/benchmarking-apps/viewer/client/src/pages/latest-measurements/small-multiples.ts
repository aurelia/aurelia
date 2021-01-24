import { ICustomAttributeController } from '@aurelia/runtime-html';
import { Measurement, WritableMeasurementKeys } from '@benchmarking-apps/test-result';
import { bindable, customElement, shadowCSS } from 'aurelia';
import * as d3 from 'd3';
import { actions, Margin, round } from './shared';
import css from './small-multiples.css';
import template from './small-multiples.html';

const margin = new Margin(40, 30, 50, 40);
const width = 500;
const height = 150;

@customElement({
  name: 'small-multiples',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [shadowCSS(css)]
})
export class SmallMultiples {
  @bindable({ callback: 'draw' }) public readonly dataset: Partial<Measurement>[];
  @bindable public readonly measurementIdentifier: (m: Partial<Measurement>, i?: number, arr?: Partial<Measurement>[]) => string;
  private readonly target!: HTMLElement;
  private readonly containers: d3.Selection<HTMLDivElement, unknown, null, undefined>[] = [];
  public readonly $controller!: ICustomAttributeController<this>;

  public attached(): void {
    this.draw();
  }

  public draw(): void {
    if (!this.$controller.isActive) { return; }
    this.clean();
    const containers = this.containers;
    const gDs = d3.group(this.dataset, (d) => `${d.initialPopulation!}|${d.totalPopulation!}`);
    const container = d3.select(this.target);
    for (const [key, ds] of gDs) {
      const [p0, pn] = key.split('|');

      const groupContainer = container.append('div').classed('container', true);
      containers.push(groupContainer);
      groupContainer.append('h2').text(`From ${p0} to ${pn}`);
      const grid = groupContainer.append('div');

      const constantPopulation = p0 === pn;
      for (const action of Object.keys(actions)) {
        if (constantPopulation && action === 'durationPopulation') { continue; }
        const svg = grid.append('svg')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('height', height)
          .attr('width', width);

        const identifier = this.measurementIdentifier;
        const xScale = d3.scaleBand()
          .domain(ds.map(identifier))
          .range([margin.left, width - margin.right])
          .paddingInner(0.05);
        const getDuration = function (d: Partial<Measurement>): number { return (d[action] ?? 0) as number; };
        const yScale = d3.scaleLinear()
          .domain([0, d3.max(ds, getDuration)!])
          .range([height - margin.bottom, margin.top]);

        const actionObj = actions[action as WritableMeasurementKeys];
        svg.selectAll('rect')
          .data(ds)
          .enter()
          .append('rect')
          .attr('x', function (d) { return xScale(identifier(d)); })
          .attr('y', function (d) { return height - yScale(getDuration(d)) - margin.bottom; })
          .attr('width', xScale.bandwidth())
          .attr('height', function (d) { return yScale(getDuration(d)); })
          .attr('fill', actionObj.color)
          .append('title')
          .text(function (d) { return `${round(getDuration(d))} ms`; });

        svg.append('g')
          .classed('x-axis', true)
          .attr('transform', `translate(0, ${height - margin.bottom})`)
          .call(d3.axisBottom(xScale));
        svg.append('g')
          .classed('y-axis', true)
          .attr('transform', `translate(${margin.left}, 0)`)
          .call(d3.axisLeft(yScale).ticks(5));
        svg.append('text')
          .attr('x', margin.left)
          .attr('y', height - margin.bottom / 3)
          .text(actionObj.description);
      }
    }
  }

  public detaching(): void {
    this.clean();
  }

  private clean() {
    const containers = this.containers;
    while (containers.length) {
      containers.pop().remove();
    }
  }
}
