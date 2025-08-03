import { IOrderRepository, IRepositoryFilters } from '@/domain/repositories/IOrderRepository';
import { GetOrdersQuery, FlatOrder, User, Order } from '@/domain/entities/order.entities';

const groupOrdersByUser = (flatOrders: FlatOrder[], productIdFilter?: number): User[] => {
  const usersMap = new Map<number, User>();

  for (const row of flatOrders) {
    if (productIdFilter && row.product_id !== productIdFilter) {
      continue;
    }
    let user = usersMap.get(row.user_id);
    if (!user) {
      user = { user_id: row.user_id, name: row.name, orders: [] };
      usersMap.set(row.user_id, user);
    }

    let order = user.orders.find((o: Order) => o.order_id === row.order_id);
    if (!order) {
      order = { order_id: row.order_id, total: 0, date: row.date, products: [] };
      user.orders.push(order);
    }

    const productValue = parseFloat(row.value as unknown as string);
    if (!isNaN(productValue)) {
      order.products.push({ product_id: row.product_id, value: productValue });
      order.total += productValue;
    }
  }

  return Array.from(usersMap.values())
    .map((user: User) => ({
      ...user,
      orders: user.orders
        .map((order: Order) => ({
          ...order,
          total: order.total,
        }))
        .filter((order: Order) => order.products.length > 0),
    }))
    .filter((user: User) => user.orders.length > 0);
};

export class OrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async getFormattedOrders(filters: GetOrdersQuery) {
    const numericProductId = filters.productId ? parseInt(filters.productId, 10) : undefined;
    const numericOrderId = filters.orderId ? parseInt(filters.orderId, 10) : undefined;

    const dbFilters: IRepositoryFilters = {
      ...filters,
      orderId: numericOrderId,
      productId: numericProductId,
    };

    const flatOrders = await this.orderRepository.findOrdersByFilter(dbFilters);
    return groupOrdersByUser(flatOrders, numericProductId);
  }
}
