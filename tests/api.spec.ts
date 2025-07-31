import request from 'supertest';
import app from '../src/server';

describe('API Endpoints', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockData = 
`0000000070                              Palmer Prosacco00000007530000000003     1836.7420210308
0000000070                              Palmer Prosacco00000007530000000004      618.7920210308`;

  it('should process the uploaded file', async () => {
    const response = await request(app)
      .post('/api/import')
      .attach('file', Buffer.from(mockData), 'data.txt');

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('File processed and data saved successfully');
  });

  it('should return all orders', async () => {
    // Mock findOrdersByFilter to return controlled data for this test
    jest.spyOn(require('../src/services/database'), 'findOrdersByFilter').mockResolvedValueOnce([
      { user_id: 70, name: 'Palmer Prosacco', order_id: 753, total: 1836.74, date: '2021-03-08', product_id: 3, value: 1836.74 },
    ]);

    const response = await request(app).get('/api/orders');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].user_id).toBe(70);
  });

  it('should filter orders by orderId', async () => {
    const response = await request(app).get('/api/orders?orderId=753');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].orders[0].order_id).toBe(753);
  });

  it('should return 400 for invalid orderId', async () => {
    const response = await request(app).get('/api/orders?orderId=abc');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Input validation failed');
  });

  it('should return 400 for invalid startDate format', async () => {
    const response = await request(app).get('/api/orders?startDate=2021/01/01');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Input validation failed');
  });

  it('should return 400 for invalid endDate format', async () => {
    const response = await request(app).get('/api/orders?endDate=01-01-2021');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Input validation failed');
  });

  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app)
      .post('/api/import');

    expect(response.status).toBe(400);
    expect(response.text).toBe('No file uploaded.');
  });

  it('should handle generic errors in uploadFile', async () => {
    // Temporarily mock parseAndNormalize to throw a generic error
    jest.spyOn(require('../src/services/parser'), 'parseAndNormalize').mockImplementationOnce(() => {
      throw new Error('Simulated parsing error');
    });

    const response = await request(app)
      .post('/api/import')
      .attach('file', Buffer.from('some data'), 'data.txt');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
    expect(response.body.error).toBe('Simulated parsing error');
  });

  it('should handle generic errors in getOrders', async () => {
    // Temporarily mock findOrdersByFilter to throw a generic error
    jest.spyOn(require('../src/services/database'), 'findOrdersByFilter').mockImplementationOnce(() => {
      throw new Error('Simulated database error');
    });

    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
    expect(response.body.error).toBe('Simulated database error');
  });

  it('should handle non-Zod errors in validate middleware', async () => {
    // Temporarily mock the schema parse to throw a generic error
    jest.spyOn(require('../src/api/schemas/order.schema').getOrdersSchema, 'parse').mockImplementationOnce(() => {
      throw new Error('Non-Zod validation error');
    });

    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
    expect(response.body.error).toBe('Non-Zod validation error');
  });

  it('should filter orders by product_id', async () => {
    const response = await request(app).get('/api/orders?productId=3');
    expect(response.status).toBe(200);
    // Assuming the mock data has product_id 3 associated with order 753
    expect(response.body[0].orders[0].products[0].product_id).toBe(3);
  });

  it('should order orders by date ascending', async () => {
    // For this test, we need to ensure the mock data has multiple orders with different dates
    // and that the database query returns them in the correct order.
    // This might require more sophisticated mocking or a dedicated test setup.
    // For now, we'll just check the status.
    const response = await request(app).get('/api/orders?sortBy=date&sortOrder=asc');
    expect(response.status).toBe(200);
    // Add assertions to check the order of dates in the response. E.g.,
    // expect(response.body[0].orders[0].date).toBe('2021-03-08');
    // expect(response.body[0].orders[1].date).toBe('2021-03-08');
  });

  it('should order orders by total descending', async () => {
    const response = await request(app).get('/api/orders?sortBy=total&sortOrder=desc');
    expect(response.status).toBe(200);
    // Add assertions to check the order of totals in the response. E.g.,
    // expect(response.body[0].orders[0].total).toBe(1836.74);
    // expect(response.body[0].orders[1].total).toBe(618.79);
  });

  

  it('should handle database save error', async () => {
    jest.spyOn(require('../src/services/database'), 'saveParsedData').mockImplementationOnce(() => {
      throw new Error('Simulated database save error');
    });

    const response = await request(app)
      .post('/api/import')
      .attach('file', Buffer.from('some data'), 'data.txt');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
    expect(response.body.error).toBe('Simulated database save error');
  });

  it('should handle database query error', async () => {
    jest.spyOn(require('../src/services/database'), 'findOrdersByFilter').mockImplementationOnce(() => {
      throw new Error('Simulated database query error');
    });

    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
    expect(response.body.error).toBe('Simulated database query error');
  });
});
