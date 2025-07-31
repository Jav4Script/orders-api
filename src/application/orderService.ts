import { findOrdersByFilter } from '../services/database';
import { Order } from '../services/parser';

export const getFormattedOrders = async (filters: any) => {
  const flatOrders = await findOrdersByFilter(filters);

  const usersMap = new Map();

  for (const row of flatOrders) {
    let user = usersMap.get(row.user_id);
    if (!user) {
      user = { user_id: row.user_id, name: row.name, orders: [] };
      usersMap.set(row.user_id, user);
    }

    let order = user.orders.find((o: any) => o.order_id === row.order_id);
    if (!order) {
      order = { order_id: row.order_id, total: 0, date: row.date, products: [] };
      user.orders.push(order);
    }

    // Apply productId filter here if it exists and the current product doesn't match
    if (filters.productId && row.product_id !== filters.productId) {
      continue; // Skip this product if it doesn't match the filter
    }

    const productValue = parseFloat(row.value);
    order.products.push({ product_id: row.product_id, value: productValue.toFixed(2) });
    order.total += productValue;
  }

  // Filter out orders that ended up with no products after filtering
  return Array.from(usersMap.values()).map((user: any) => ({
    ...user,
    orders: user.orders.filter((order: any) => order.products.length > 0).map((order: any) => ({
      ...order,
      total: order.total.toFixed(2),
    })),
  })).filter((user: any) => user.orders.length > 0); // Filter out users with no orders
};