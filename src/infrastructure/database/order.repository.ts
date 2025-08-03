import { IOrderRepository, IRepositoryFilters } from '@/domain/repositories/IOrderRepository';
import { FlatOrder } from '@/domain/entities/order.entities';
import { getDbConnection } from '@/infrastructure/database/database';
import { Database } from 'sqlite';

export class SqliteOrderRepository implements IOrderRepository {
  private db: Database | null = null;

  constructor(dbInstance?: Database) {
    if (dbInstance) {
      this.db = dbInstance;
    }
  }

  private async getDatabase(): Promise<Database> {
    if (!this.db) {
      this.db = await getDbConnection();
    }
    return this.db;
  }

  async findOrdersByFilter(filters: IRepositoryFilters): Promise<FlatOrder[]> {
    const db = await this.getDatabase();
    let query = `
      SELECT
        u.user_id, u.name,
        o.order_id, o.total, o.date,
        p.product_id, p.value
      FROM users u
      JOIN orders o ON u.user_id = o.user_id
      JOIN products p ON o.order_id = p.order_id
    `;

    const whereClauses: string[] = [];
    const queryParams: (string | number)[] = [];

    if (filters.orderId) {
      queryParams.push(filters.orderId);
      whereClauses.push(`o.order_id = ?`);
    }

    if (filters.startDate) {
      queryParams.push(filters.startDate);
      whereClauses.push(`o.date >= ?`);
    }

    if (filters.endDate) {
      queryParams.push(filters.endDate);
      whereClauses.push(`o.date <= ?`);
    }

    if (filters.productId) {
      queryParams.push(filters.productId);
      whereClauses.push(`p.product_id = ?`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    if (filters.sortBy) {
      const orderByColumn = filters.sortBy === 'order_id' ? 'o.order_id' : filters.sortBy;
      const orderDirection = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${orderByColumn} ${orderDirection}`;
    }

    return db.all(query, ...queryParams);
  }
}