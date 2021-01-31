import { ICustomAttributeController } from '@aurelia/runtime-html';
import { Measurement, WritableMeasurementKeys } from '@benchmarking-apps/test-result';
import { bindable, customElement, ILogger, shadowCSS } from 'aurelia';
import * as d3 from 'd3';
import { AvgMeasurement } from '../shared/data';
import { actions, Margin, round } from '../shared/utils';
import css from './stacked-bars.css';
import template from './stacked-bars.html';

const margin = new Margin(40, 30, 30, 40);
const width = 800;
const height = 600;
type $Measurement = Measurement | AvgMeasurement;
@customElement({
  name: 'stacked-bars',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [shadowCSS(css)],
})
export class StackedBars {
  @bindable({ callback: 'draw' }) public readonly dataset: Partial<$Measurement>[];
  @bindable public readonly measurementIdentifier: (m: Partial<$Measurement>, i?: number, arr?: Partial<$Measurement>[]) => string;
  @bindable public readonly totalDurationFn: (m: Partial<$Measurement>) => number;
  public readonly $controller!: ICustomAttributeController<this>;
  private readonly target!: HTMLElement;
  private readonly actions = Object.values(actions);
  private readonly svgs: d3.Selection<SVGSVGElement, unknown, null, undefined>[] = [];

  public constructor(
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('StackedBars');
  }

  public attached(): void {
    this.draw();
  }

  private draw() {
    if (!this.$controller.isActive) { return; }
    this.clean();
    const logger = this.logger;
    const gDs = d3.group(this.dataset, (d) => `${d.initialPopulation!}|${d.totalPopulation!}`);
    const stack = d3.stack<Partial<$Measurement>>()
      .keys(Object.keys(actions))
      .value(function (d, key) { return (d[key] ?? 0) as number; });
    const target = this.target;
    const svgs = this.svgs;

    for (const [key, ds] of gDs) {
      const series = stack(ds);
      logger.debug('series', series);
      const svg = d3.select(target)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('height', height)
        .attr('width', width);
      svgs.push(svg);

      const [p0, pn] = key.split('|');
      svg.append('text')
        .text(`From ${p0} to ${pn}`)
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle');

      const groups = svg.selectAll('g')
        .data(series)
        .enter()
        .append('g')
        .style('fill', function (d) { return actions[d.key as WritableMeasurementKeys].color; });

      const identifier = this.measurementIdentifier;
      const xScale = d3.scaleBand()
        .domain(ds.map(identifier))
        .range([margin.left, width - margin.right])
        .paddingInner(0.05);
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(ds, this.totalDurationFn)!])
        .range([height - margin.bottom, margin.top]);

      groups.selectAll('rect')
        .data(function (d) { return d; })
        .enter()
        .append('rect')
        .attr('x', function (d) { return xScale(identifier(d.data))!; })
        .attr('y', function (d) { return yScale(d[1]); })
        .attr('width', xScale.bandwidth())
        .attr('height', function (d) { return yScale(d[0]) - yScale(d[1]); })
        .append('title')
        .text(function (d) { return `${round(d[1] - d[0])} ms`; });

      svg.append("g")
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
      svg.append("g")
        .classed('y-axis', true)
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));
    }
  }

  public detaching(): void {
    this.clean();
  }

  private clean() {
    const svgs = this.svgs;
    while (svgs.length) {
      svgs.pop().remove();
    }
  }
}
