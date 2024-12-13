import { Category, DashboardState, ForecastRecord, GlobalFilters, InventoryAlert, Product, SaleRecord, TrendAlert } from './domain/index.js';

export const initDashboardState = () => {
  const globalFilters = new GlobalFilters(
    new Date('2024-01-02'),
    new Date('2024-01-04'),
    new Set(['cat-electronics', 'cat-home-appliances']),
    true,
    true,
  );

  const state = new DashboardState(globalFilters);

  const electronics = state.addCategory(new Category(
    'cat-electronics',
    'Electronics'
  ));

  const laptopX = electronics.addProduct(new Product(
    state,
    'prod-laptop-1',
    'Laptop X',
    'cat-electronics',
    1499.99,
    20,
    5,
    0
  ));
  laptopX.historicalSalesData.push(
    new SaleRecord(new Date('2024-01-01'), 5),
    new SaleRecord(new Date('2024-01-02'), 3),
    new SaleRecord(new Date('2024-01-03'), 2),
    new SaleRecord(new Date('2024-01-04'), 4),
    new SaleRecord(new Date('2024-01-10'), 6)
  );
  laptopX.forecastedSalesData.push(
    new ForecastRecord(new Date('2024-02-01'), 4),
    new ForecastRecord(new Date('2024-02-02'), 5)
  );

  const smartphoneY = electronics.addProduct(new Product(
    state,
    'prod-smartphone-1',
    'Smartphone Y',
    'cat-electronics',
    799.99,
    50,
    10,
    20
  ));
  smartphoneY.historicalSalesData.push(
    new SaleRecord(new Date('2024-01-02'), 10),
    new SaleRecord(new Date('2024-01-03'), 9),
    new SaleRecord(new Date('2024-01-04'), 8),
    new SaleRecord(new Date('2024-01-05'), 2)
  );

  const homeAppliances = state.addCategory(new Category(
    'cat-home-appliances',
    'Home Appliances'
  ));

  const microwaveZ = homeAppliances.addProduct(new Product(
    state,
    'prod-microwave-1',
    'Microwave Z',
    'cat-home-appliances',
    199.99,
    10,
    3,
    5
  ));
  microwaveZ.historicalSalesData.push(
    new SaleRecord(new Date('2024-01-01'), 2),
    new SaleRecord(new Date('2024-01-02'), 1),
    new SaleRecord(new Date('2024-01-03'), 2),
    new SaleRecord(new Date('2024-01-04'), 3),
    new SaleRecord(new Date('2024-01-05'), 1)
  );
  microwaveZ.forecastedSalesData.push(
    new ForecastRecord(new Date('2024-02-01'), 2),
    new ForecastRecord(new Date('2024-02-02'), 3)
  );

  const blenderA1 = homeAppliances.addProduct(new Product(
    state,
    'prod-blender-1',
    'Blender A1',
    'cat-home-appliances',
    99.99,
    5,
    2,
    0
  ));
  blenderA1.historicalSalesData.push(
    new SaleRecord(new Date('2024-01-02'), 1),
    new SaleRecord(new Date('2024-01-03'), 2),
    new SaleRecord(new Date('2024-01-04'), 2),
    new SaleRecord(new Date('2024-01-05'), 1)
  );
  blenderA1.forecastedSalesData.push(
    new ForecastRecord(new Date('2024-02-01'), 2),
    new ForecastRecord(new Date('2024-02-02'), 2)
  );

  const accessories = state.addCategory(new Category(
    'cat-accessories',
    'Accessories'
  ));

  const headphonesW = accessories.addProduct(new Product(
    state,
    'prod-headphones-1',
    'Wireless Headphones W',
    'cat-accessories',
    199.99,
    2,
    5,
    0
  ));
  headphonesW.historicalSalesData.push(
    new SaleRecord(new Date('2024-01-02'), 1),
    new SaleRecord(new Date('2024-01-03'), 1)
  );
  headphonesW.forecastedSalesData.push(
    new ForecastRecord(new Date('2024-02-01'), 3)
  );

  state.inventoryAlerts.push(
    new InventoryAlert(
      'inv-alert-1',
      'Low inventory on Laptop X',
      new Date('2024-01-06'),
      'prod-laptop-1'
    ),
    new InventoryAlert(
      'inv-alert-2',
      'Low inventory on Wireless Headphones W (not in selected categories)',
      new Date('2024-01-06'),
      'prod-headphones-1'
    )
  );

  state.trendAlerts.push(
    new TrendAlert(
      'trend-alert-1',
      'Sales decline in Electronics category',
      'high',
      ['cat-electronics'],
      new Date('2024-01-07')
    ),
    new TrendAlert(
      'trend-alert-2',
      'Potential growth in Accessories category (not filtered)',
      'medium',
      ['cat-accessories'],
      new Date('2024-01-08')
    )
  );

  return state;
};
