import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

import { User } from '@/domain/entities/order.entities';

const DB_FILE = process.env.DB_FILE || './data/database.sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
let inMemoryDb: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDbConnection(dbPath?: string) {
  const filename = dbPath || DB_FILE;
  if (filename === ':memory:') {
    if (!inMemoryDb) {
      inMemoryDb = await open({
        filename: ':memory:',
        driver: sqlite3.Database,
      });
    }
    return inMemoryDb;
  }

  if (!db) {
    db = await open({
      filename: filename,
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function closeDbConnection() {
  if (db) {
    await db.close();
    db = null;
  }
  if (inMemoryDb) {
    await inMemoryDb.close();
    inMemoryDb = null;
  }
}

// Initializes the database schema.
export async function initializeDatabase(dbPath?: string) {
  const currentDb = await getDbConnection(dbPath);
  await currentDb.exec(`
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      user_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE orders (
      order_id INTEGER PRIMARY KEY,
      user_id INTEGER, 
      total REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    );
    CREATE TABLE products (
      product_id INTEGER,
      order_id INTEGER,
      value REAL NOT NULL,
      PRIMARY KEY (product_id, order_id),
      FOREIGN KEY(order_id) REFERENCES orders(order_id)
    );
  `);
  return currentDb; // Return the database instance
}

export async function clearDatabase(dbInstance: Database) {
  await dbInstance.exec(`
    DELETE FROM products;
    DELETE FROM orders;
    DELETE FROM users;
  `);
}

// Saves the normalized user data into the database.
export async function saveParsedData(users: User[], dbInstance?: Database) {
  const currentDb = dbInstance || (await getDbConnection());
  await currentDb.run('BEGIN TRANSACTION');
  try {
    for (const user of users) {
      await currentDb.run('INSERT OR IGNORE INTO users (user_id, name) VALUES (?, ?)', user.user_id, user.name);
      for (const order of user.orders) {
        await currentDb.run(
          'INSERT OR IGNORE INTO orders (order_id, user_id, total, date) VALUES (?, ?, ?, ?)',
          order.order_id,
          user.user_id,
          order.total,
          order.date,
        );
        for (const product of order.products) {
          await currentDb.run(
            'INSERT OR IGNORE INTO products (product_id, order_id, value) VALUES (?, ?, ?)',
            product.product_id,
            order.order_id,
            product.value,
          );
        }
      }
    }
    await currentDb.run('COMMIT');
  } catch (e) {
    await currentDb.run('ROLLBACK');
    throw e;
  }
}
