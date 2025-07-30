import { findOrdersByFilter } from '../services/database';
import { Order } from '../services/parser'; // Assuming Order type is defined here or needs to be defined

export const getFormattedOrders = async (filters: any) => {
  const flatOrders = await findOrdersByFilter(filters);

  // Re-group flat data into nested structure
  const usersMap = new Map();
  for (const row of flatOrders) {
    let user = usersMap.get(row.user_id);
    if (!user) {
      user = { user_id: row.user_id, name: row.name, orders: [] };
      usersMap.set(row.user_id, user);
    }

    let order = user.orders.find((o: any) => o.order_id === row.order_id);
    if (!order) {
      order = { order_id: row.order_id, total: row.total, date: row.date, products: [] };
      user.orders.push(order);
    }

    order.products.push({ product_id: row.product_id, value: row.value.toFixed(2) });
  }

  return Array.from(usersMap.values());
};