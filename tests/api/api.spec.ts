import request from 'supertest';

import { createApp } from '@/app';
import { initializeDatabase, closeDbConnection, clearDatabase } from '@/infrastructure/database/database';
import { Database } from 'sqlite';
import { OrderUseCase } from '@/application/usecases/order.usecase';
import { SqliteOrderRepository } from '@/infrastructure/database/order.repository';

let db: Database;
let app: any;

describe('Order API Integration Tests', () => {
  beforeAll(async () => {
    db = await initializeDatabase(':memory:');
    const orderRepository = new SqliteOrderRepository(db);
    const orderUseCase = new OrderUseCase(orderRepository);
    app = createApp(orderUseCase, db);
  });

  afterEach(async () => {
    // Clear the database after each test to ensure test isolation
    await clearDatabase(db);
  });

  afterAll(async () => {
    await closeDbConnection();
  });

  it('should upload a file and return 201 status', async () => {
    const filePath = './tests/mocks/data_1.txt';
    const response = await request(app).post('/api/orders').attach('file', filePath);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'File processed and data saved successfully' });
  });

  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app).post('/api/orders');

    expect(response.status).toBe(400);
    expect(response.text).toEqual('No file uploaded.');
  });

  it('should return a list of orders', async () => {
    const filePath = './tests/mocks/data_1.txt';
    await request(app).post('/api/orders').attach('file', filePath);

    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('user_id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('orders');
    expect(response.body[0].orders[0]).toHaveProperty('order_id');
    expect(response.body[0].orders[0]).toHaveProperty('total');
    expect(response.body[0].orders[0]).toHaveProperty('date');
    expect(response.body[0].orders[0]).toHaveProperty('products');
  });

  it('should return filtered orders by orderId', async () => {
    const filePath = './tests/mocks/data_1.txt';
    await request(app).post('/api/orders').attach('file', filePath);

    const response = await request(app).get('/api/orders?orderId=753');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].orders[0].order_id).toBe(753);
  });

  it('should return filtered orders by startDate and endDate', async () => {
    const filePath = './tests/mocks/data_1.txt';
    await request(app).post('/api/orders').attach('file', filePath);

    const response = await request(app).get('/api/orders?startDate=2021-01-01&endDate=2021-12-31');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return filtered orders by productId', async () => {
    const filePath = './tests/mocks/data_1.txt';
    await request(app).post('/api/orders').attach('file', filePath);

    const response = await request(app).get('/api/orders?productId=3');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].orders[0].products[0].product_id).toBe(3);
  });

  it('should return orders sorted by total in descending order', async () => {
    const filePath = './tests/mocks/data_1.txt';
    await request(app).post('/api/orders').attach('file', filePath);

    const response = await request(app).get('/api/orders?sortBy=total&sortOrder=desc');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    const firstOrderTotal = parseFloat(response.body[0].orders[0].total);
    const secondOrderTotal = parseFloat(response.body[0].orders[1].total);
    expect(firstOrderTotal).toBeGreaterThanOrEqual(secondOrderTotal);
  });
});
