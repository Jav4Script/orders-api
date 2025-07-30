
export interface Product {
  product_id: number;
  value: number;
}

export interface Order {
  order_id: number;
  total: number;
  date: string;
  products: Product[];
}

export interface User {
  user_id: number;
  name: string;
  orders: Order[];
}

export const parseAndNormalize = (fileContent: string): User[] => {
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');

  const usersMap = new Map<number, User>();

  for (const line of lines) {
    const userId = parseInt(line.substring(0, 10), 10);
    const userName = line.substring(10, 55).trim();
    const orderId = parseInt(line.substring(55, 65), 10);
    const productId = parseInt(line.substring(65, 75), 10);
    const productValue = parseFloat(line.substring(75, 87));
    const dateStr = line.substring(87, 95);
    const purchaseDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

    let user = usersMap.get(userId);
    if (!user) {
      user = { user_id: userId, name: userName, orders: [] };
      usersMap.set(userId, user);
    }

    let order = user.orders.find(o => o.order_id === orderId);
    if (!order) {
      order = { order_id: orderId, total: 0, date: purchaseDate, products: [] };
      user.orders.push(order);
    }

    order.products.push({
      product_id: productId,
      value: productValue,
    });

    order.total = order.total + productValue;
  }

  return Array.from(usersMap.values());
};
