import { User } from '@/domain/entities/order.entities';
import { IFileParser } from '@/domain/services/IFileParser';

const FieldLength = {
  UserId: 10,
  UserName: 45,
  OrderId: 10,
  ProductId: 10,
  ProductValue: 12,
  Date: 8,
} as const;

interface ParsedLine {
  userId: number;
  userName: string;
  orderId: number;
  productId: number;
  productValue: number;
  purchaseDate: string;
}

export class FileParser implements IFileParser {
  private parseLine(line: string): ParsedLine {
    let offset = 0;

    const userIdStr = line.substring(offset, offset + FieldLength.UserId);
    offset += FieldLength.UserId;

    const userName = line.substring(offset, offset + FieldLength.UserName).trim();
    offset += FieldLength.UserName;

    const orderIdStr = line.substring(offset, offset + FieldLength.OrderId);
    offset += FieldLength.OrderId;

    const productIdStr = line.substring(offset, offset + FieldLength.ProductId);
    offset += FieldLength.ProductId;

    const productValueStr = line.substring(offset, offset + FieldLength.ProductValue);
    offset += FieldLength.ProductValue;

    const dateStr = line.substring(offset, offset + FieldLength.Date);

    let userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      console.warn(`Invalid userId: '${userIdStr}'. Using placeholder 0.`);
      userId = 0;
    }

    let orderId = parseInt(orderIdStr, 10);
    if (isNaN(orderId)) {
      console.warn(`Invalid orderId: '${orderIdStr}'. Using placeholder 0.`);
      orderId = 0;
    }

    let productId = parseInt(productIdStr, 10);
    if (isNaN(productId)) {
      console.warn(`Invalid productId: '${productIdStr}'. Using placeholder 0.`);
      productId = 0;
    }

    let productValue = parseFloat(productValueStr.trim());
    if (isNaN(productValue)) {
      console.warn(`Invalid productValue: '${productValueStr}'. Using placeholder 0.`);
      productValue = 0;
    }

    const purchaseDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

    return { userId, userName, orderId, productId, productValue, purchaseDate };
  }

  parseAndNormalize(fileContent: string): User[] {
    const lines = fileContent.split('\n').filter((line) => line.trim() !== '');
    const usersMap = new Map<number, User>();

    for (const line of lines) {
      const { userId, userName, orderId, productId, productValue, purchaseDate } = this.parseLine(line);

      let user = usersMap.get(userId);
      if (!user) {
        user = { user_id: userId, name: userName, orders: [] };
        usersMap.set(userId, user);
      }

      let order = user.orders.find((o) => o.order_id === orderId);
      if (!order) {
        order = { order_id: orderId, total: 0, date: purchaseDate, products: [] };
        user.orders.push(order);
      }

      order.products.push({ product_id: productId, value: productValue });
      order.total += productValue;
    }

    return Array.from(usersMap.values());
  }
}
