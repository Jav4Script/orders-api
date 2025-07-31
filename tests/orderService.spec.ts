import { getFormattedOrders } from '../src/application/orderService';
import * as databaseService from '../src/services/database';

describe('Order Service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should correctly format and group orders with dynamic total calculation', async () => {
    // Mock data that findOrdersByFilter would return (flat structure)
    const mockFlatOrders = [
      { user_id: 1, name: 'User A', order_id: 101, total: 0, date: '2023-01-01', product_id: 1001, value: 10.50 },
      { user_id: 1, name: 'User A', order_id: 101, total: 0, date: '2023-01-01', product_id: 1002, value: 20.00 },
      { user_id: 1, name: 'User A', order_id: 102, total: 0, date: '2023-01-02', product_id: 1003, value: 5.00 },
      { user_id: 2, name: 'User B', order_id: 201, total: 0, date: '2023-01-03', product_id: 2001, value: 100.00 },
    ];

    jest.spyOn(databaseService, 'findOrdersByFilter').mockResolvedValue(mockFlatOrders);

    const result = await getFormattedOrders({});

    expect(result).toHaveLength(2); // Two users

    // Assert User A
    const userA = result.find(u => u.user_id === 1);
    expect(userA).toBeDefined();
    expect(userA.name).toBe('User A');
    expect(userA.orders).toHaveLength(2);

    // Assert Order 101 for User A
    const order101 = userA.orders.find((o: any) => o.order_id === 101);
    expect(order101).toBeDefined();
    expect(order101.total).toBe('30.50'); // 10.50 + 20.00
    expect(order101.date).toBe('2023-01-01');
    expect(order101.products).toHaveLength(2);
    expect(order101.products).toEqual(expect.arrayContaining([
      { product_id: 1001, value: '10.50' },
      { product_id: 1002, value: '20.00' },
    ]));

    // Assert Order 102 for User A
    const order102 = userA.orders.find((o: any) => o.order_id === 102);
    expect(order102).toBeDefined();
    expect(order102.total).toBe('5.00');
    expect(order102.date).toBe('2023-01-02');
    expect(order102.products).toHaveLength(1);
    expect(order102.products).toEqual([{ product_id: 1003, value: '5.00' }]);

    // Assert User B
    const userB = result.find(u => u.user_id === 2);
    expect(userB).toBeDefined();
    expect(userB.name).toBe('User B');
    expect(userB.orders).toHaveLength(1);

    // Assert Order 201 for User B
    const order201 = userB.orders.find((o: any) => o.order_id === 201);
    expect(order201).toBeDefined();
    expect(order201.total).toBe('100.00');
    expect(order201.date).toBe('2023-01-03');
    expect(order201.products).toHaveLength(1);
    expect(order201.products).toEqual([{ product_id: 2001, value: '100.00' }]);
  });

  it('should correctly filter orders by productId and calculate total dynamically', async () => {
    const mockFlatOrders = [
      { user_id: 1, name: 'User A', order_id: 101, total: 0, date: '2023-01-01', product_id: 1001, value: 10.50 },
      { user_id: 1, name: 'User A', order_id: 101, total: 0, date: '2023-01-01', product_id: 1002, value: 20.00 },
      { user_id: 1, name: 'User A', order_id: 102, total: 0, date: '2023-01-02', product_id: 1003, value: 5.00 },
    ];

    jest.spyOn(databaseService, 'findOrdersByFilter').mockResolvedValue(mockFlatOrders);

    // Filter for product_id 1001
    const result = await getFormattedOrders({ productId: 1001 });

    expect(result).toHaveLength(1); // Only User A
    const userA = result[0];
    expect(userA.orders).toHaveLength(1); // Only order 101 should contain product 1001

    const order101 = userA.orders[0];
    expect(order101.order_id).toBe(101);
    expect(order101.total).toBe('10.50'); // Only product 1001's value
    expect(order101.products).toHaveLength(1);
    expect(order101.products).toEqual([{ product_id: 1001, value: '10.50' }]);
  });

  it('should return an empty array if no orders are found', async () => {
    jest.spyOn(databaseService, 'findOrdersByFilter').mockResolvedValue([]);

    const result = await getFormattedOrders({});
    expect(result).toHaveLength(0);
  });
});