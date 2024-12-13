import {
  DashboardState,
  ForecastRecord,
  GlobalFilters,
  InventoryAlert,
  SaleRecord,
  TrendAlert
} from './domain/index.js';

export const initDashboardState = () => {
  const globalFilters = new GlobalFilters(
    new Date('2024-01-02'),
    new Date('2024-01-04'),
    new Set(['cat-electronics', 'cat-home-appliances']),
    true,
    true,
  );

  const state = new DashboardState(globalFilters);

  const electronics = state.addCategory({
    id: 'cat-electronics',
    name: 'Electronics'
  });
  const laptopX = electronics.addProduct({
    id: 'prod-laptop-1',
    name: 'Laptop X',
    categoryId: 'cat-electronics',
    price: 1499.99,
    currentInventory: 20,
    reorderThreshold: 5,
    pendingPurchaseOrderQty: 0
  });
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

  const smartphoneY = electronics.addProduct({
    id: 'prod-smartphone-1',
    name: 'Smartphone Y',
    categoryId: 'cat-electronics',
    price: 799.99,
    currentInventory: 50,
    reorderThreshold: 10,
    pendingPurchaseOrderQty: 20
  });
  smartphoneY.historicalSalesData.push(
    new SaleRecord(new Date('2024-01-02'), 10),
    new SaleRecord(new Date('2024-01-03'), 9),
    new SaleRecord(new Date('2024-01-04'), 8),
    new SaleRecord(new Date('2024-01-05'), 2)
  );

  const homeAppliances = state.addCategory({
    id: 'cat-home-appliances',
    name: 'Home Appliances'
  });

  const microwaveZ = homeAppliances.addProduct({
    id: 'prod-microwave-1',
    name: 'Microwave Z',
    categoryId: 'cat-home-appliances',
    price: 199.99,
    currentInventory: 10,
    reorderThreshold: 3,
    pendingPurchaseOrderQty: 5
  });
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

  const blenderA1 = homeAppliances.addProduct({
    id: 'prod-blender-1',
    name: 'Blender A1',
    categoryId: 'cat-home-appliances',
    price: 99.99,
    currentInventory: 5,
    reorderThreshold: 2,
    pendingPurchaseOrderQty: 0
  });
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

  const accessories = state.addCategory({
    id: 'cat-accessories',
    name: 'Accessories'
  });

  const headphonesW = accessories.addProduct({
    id: 'prod-headphones-1',
    name: 'Wireless Headphones W',
    categoryId: 'cat-accessories',
    price: 199.99,
    currentInventory: 2,
    reorderThreshold: 5,
    pendingPurchaseOrderQty: 0
  });
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
