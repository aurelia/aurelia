import { customElement, shadowCSS } from 'aurelia';
import template from './app-shell.html';
import css from './app-shell.css';

import { MeasurementsPage } from '../pages/measurements';
import { LeftSidebar } from './left-sidebar';
import { LatestMeasurements } from '../pages/latest-measurements';
import { CompareBranches } from '../pages/compare-branches';

@customElement({
  name: 'app-shell',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [
    shadowCSS(css),
    MeasurementsPage,
    LeftSidebar,
    LatestMeasurements,
    CompareBranches,
  ],
})
export class AppShell {
  public static routes = [
    {
      path: 'measurements',
      component: MeasurementsPage,
    },
    {
      path: 'latest-measurements',
      component: LatestMeasurements,
    },
    {
      path: 'compare',
      component: CompareBranches,
    }
  ];
}
