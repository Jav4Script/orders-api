import { OrderUseCase } from '@/application/usecases/order.usecase';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';

describe('OrderUseCase', () => {
  let orderUseCase: OrderUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;

  beforeEach(() => {
    mockOrderRepository = {
      findOrdersByFilter: jest.fn(),
    };
    orderUseCase = new OrderUseCase(mockOrderRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should correctly format and group orders with dynamic total calculation', async () => {
    const mockFlatOrders = [
      { user_id: 1, name: 'User A', order_id: 101, total: 0, date: '2023-01-01', product_id: 1001, value: 10.50 },
      { user_id: 1, name: 'User A', order_id: 101, total: 0, date: '2023-01-01', product_id: 1002, value: 20.00 },
      { user_id: 1, name: 'User A', order_id: 102, total: 0, date: '2023-01-02', product_id: 1003, value: 5.00 },
      { user_id: 2, name: 'User B', order_id: 201, total: 0, date: '2023-01-03', product_id: 2001, value: 100.00 },
    ];

    mockOrderRepository.findOrdersByFilter.mockResolvedValue(mockFlatOrders);

    const result = await orderUseCase.getFormattedOrders({});

    expect(result).toHaveLength(2);

    const userA = result.find(u => u.user_id === 1);
    expect(userA).toBeDefined();
    if (!userA) return;

    expect(userA.name).toBe('User A');
    expect(userA.orders).toHaveLength(2);

    const order101 = userA.orders.find((o: any) => o.order_id === 101);
    expect(order101).toBeDefined();
    if (!order101) return;

    expect(order101.total).toBe(30.50);
    expect(order101.date).toBe('2023-01-01');
    expect(order101.products).toHaveLength(2);
    expect(order101.products).toEqual(expect.arrayContaining([
      { product_id: 1001, value: 10.50 },
      { product_id: 1002, value: 20.00 },
    ]));

    const order102 = userA.orders.find((o: any) => o.order_id === 102);
    expect(order102).toBeDefined();
    if (!order102) return;

    expect(order102.total).toBe(5.00);
    expect(order102.date).toBe('2023-01-02');
    expect(order102.products).toHaveLength(1);
    expect(order102.products).toEqual([{ product_id: 1003, value: 5.00 }]);

    const userB = result.find(u => u.user_id === 2);
    expect(userB).toBeDefined();
    if (!userB) return;

    expect(userB.name).toBe('User B');
    expect(userB.orders).toHaveLength(1);

    const order201 = userB.orders.find((o: any) => o.order_id === 201);
    expect(order201).toBeDefined();
    if (!order201) return;

    expect(order201.total).toBe(100.00);
    expect(order201.date).toBe('2023-01-03');
    expect(order201.products).toHaveLength(1);
    expect(order201.products).toEqual([{ product_id: 2001, value: 100.00 }]);
  });



  



  it('should return an empty array if no orders are found', async () => {
    mockOrderRepository.findOrdersByFilter.mockResolvedValue([]);

    const result = await orderUseCase.getFormattedOrders({});
    expect(result).toHaveLength(0);
  });

  it('should correctly filter orders by orderId', async () => {
    const mockFlatOrders = [
      { user_id: 1, name: 'User A', order_id: 101, total: 0, date: '2023-01-01', product_id: 1001, value: 10.50 },
    ];

    mockOrderRepository.findOrdersByFilter.mockResolvedValue(mockFlatOrders);

    const result = await orderUseCase.getFormattedOrders({ orderId: '101' });

    expect(result).toHaveLength(1);
    expect(result[0].orders[0].order_id).toBe(101);
  });

  it('should correctly filter orders by date range', async () => {
    const mockFlatOrders = [
      { user_id: 1, name: 'User A', order_id: 101, total: 0, date: '2023-01-15', product_id: 1001, value: 10.50 },
    ];

    mockOrderRepository.findOrdersByFilter.mockResolvedValue(mockFlatOrders);

    const result = await orderUseCase.getFormattedOrders({ startDate: '2023-01-01', endDate: '2023-01-31' });

    expect(result).toHaveLength(1);
    expect(result[0].orders[0].date).toBe('2023-01-15');
  });
});