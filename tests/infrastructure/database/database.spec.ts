import sqlite3 from 'sqlite3';
import { User } from '@/domain/entities/order.entities';
import { Database } from 'sqlite';

let dbInstance: Database | null = null;

// Mock controlado para reutilizar a mesma instância de banco em memória
jest.mock('sqlite', () => {
  const original = jest.requireActual('sqlite');
  return {
    ...original,
    open: jest.fn(async () => {
      if (!dbInstance) {
        dbInstance = await original.open({ filename: ':memory:', driver: sqlite3.Database });
      }

      return dbInstance;
    }),
  };
});

describe('Database Service', () => {
  let initializeDatabase: any;
  let getDbConnection: any;
  let saveParsedData: any;

  beforeEach(async () => {
    jest.resetModules();

    // Reimporta os módulos para garantir isolamento
    const dbModule = await import('@/infrastructure/database/database');
    initializeDatabase = dbModule.initializeDatabase;
    getDbConnection = dbModule.getDbConnection;
    saveParsedData = dbModule.saveParsedData;

    await initializeDatabase();
  });

  afterEach(async () => {
    if (dbInstance) {
      await dbInstance.close();
      dbInstance = null;
    }
  });

  it('should initialize the database and create tables', async () => {
    const db = await getDbConnection();
    const usersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    const ordersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'");
    const productsTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'");

    expect(usersTable).toBeDefined();
    expect(ordersTable).toBeDefined();
    expect(productsTable).toBeDefined();
  });

  it('should save parsed data correctly into the database', async () => {
    const users: User[] = [
      {
        user_id: 1,
        name: 'Anderson',
        orders: [
          {
            order_id: 100,
            total: 150.75,
            date: '2025-08-03',
            products: [
              { product_id: 1, value: 50.25 },
              { product_id: 2, value: 100.50 },
            ],
          },
        ],
      },
    ];

    await saveParsedData(users);

    const db = await getDbConnection();
    const userResult = await db.get('SELECT * FROM users WHERE user_id = ?', 1);
    const orderResult = await db.get('SELECT * FROM orders WHERE order_id = ?', 100);
    const productResult = await db.all('SELECT * FROM products WHERE order_id = ?', 100);

    expect(userResult.name).toBe('Anderson');
            expect(orderResult.total).toBe(150.75);
    expect(productResult).toHaveLength(2);
  });

  it('should handle saving empty user data gracefully', async () => {
    const users: User[] = [];
    await expect(saveParsedData(users)).resolves.not.toThrow();
  });
});