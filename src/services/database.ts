import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { User } from './parser';

const DB_FILE = './data/database.sqlite';

async function getDbConnection() {
  return open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });
}

export async function initializeDatabase() {
  const db = await getDbConnection();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY,
      user_id INTEGER, 
      total REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    );
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER,
      order_id INTEGER,
      value REAL NOT NULL,
      PRIMARY KEY (product_id, order_id),
      FOREIGN KEY(order_id) REFERENCES orders(order_id)
    );
  `);
  await db.close();
}

export async function saveParsedData(users: User[]) {
  const db = await getDbConnection();
  await db.run('BEGIN TRANSACTION');
  try {
    for (const user of users) {
      await db.run('INSERT OR IGNORE INTO users (user_id, name) VALUES (?, ?)', user.user_id, user.name);
      for (const order of user.orders) {
        await db.run('INSERT OR IGNORE INTO orders (order_id, user_id, total, date) VALUES (?, ?, ?, ?)', order.order_id, user.user_id, order.total, order.date);
        for (const product of order.products) {
          await db.run('INSERT OR IGNORE INTO products (product_id, order_id, value) VALUES (?, ?, ?)', product.product_id, order.order_id, product.value);
        }
      }
    }
    await db.run('COMMIT');
  } catch (e) {
    await db.run('ROLLBACK');
    throw e;
  } finally {
    await db.close();
  }
}

export async function findOrdersByFilter(filters: { orderId?: number; startDate?: string; endDate?: string; productId?: number; sortBy?: 'order_id' | 'total' | 'date'; sortOrder?: 'asc' | 'desc'; }) {
  const db = await getDbConnection();
  try {
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
    const queryParams: any[] = [];

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
  } finally {
    await db.close();
  }
}