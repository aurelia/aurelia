export class MyApp {
  public notes = 'Sales grew in every region except the north.';
  public showLines = false;
  public failNextMapLoad = false;
  public sales = [42, 38, 51, 60, 57, 71];
  public regions = [
    { name: 'North', revenue: 120 },
    { name: 'South', revenue: 180 },
    { name: 'East', revenue: 150 },
    { name: 'West', revenue: 210 },
  ];
  public lines = [
    { product: 'Desk', quantity: 12 },
    { product: 'Chair', quantity: 40 },
    { product: 'Lamp', quantity: 25 },
  ];

  // Loading code from the view model, instead of with <import defer>, lets the page decide what to load
  public loadMap = () => {
    if (this.failNextMapLoad) {
      this.failNextMapLoad = false;
      return Promise.reject(new Error('the download failed (simulated)'));
    }
    return import('./region-map');
  };
}
