
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
    let userId = parseInt(line.substring(0, 10), 10);
    if (isNaN(userId)) {
      console.warn(`Invalid userId found, replacing with -1: ${line}`);
      userId = -1; // Placeholder for invalid userId
    }

    const userName = line.substring(10, 55).trim();

    let orderId = parseInt(line.substring(55, 65), 10);
    if (isNaN(orderId)) {
      console.warn(`Invalid orderId found, replacing with -1: ${line}`);
      orderId = -1; // Placeholder for invalid orderId
    }

    let productId = parseInt(line.substring(65, 75), 10);
    if (isNaN(productId)) {
      console.warn(`Invalid productId found, replacing with -1: ${line}`);
      productId = -1; // Placeholder for invalid productId
    }

    let productValue = parseFloat(line.substring(75, 87));
    if (isNaN(productValue)) {
      console.warn(`Invalid productValue found, replacing with 0: ${line}`);
      productValue = 0; // Placeholder for invalid productValue
    }

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
