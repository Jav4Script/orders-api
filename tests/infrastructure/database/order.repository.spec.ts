import { SqliteOrderRepository } from '@/infrastructure/database/order.repository';
import { initializeDatabase, saveParsedData, closeDbConnection } from '@/infrastructure/database/database';
import { User } from '@/domain/entities/order.entities';

describe('SqliteOrderRepository', () => {
  let repository: SqliteOrderRepository;

  beforeEach(async () => {
    await initializeDatabase();
    repository = new SqliteOrderRepository();

    // Inserir dados de teste
    const users: User[] = [
      {
        user_id: 1,
        name: 'User A',
        orders: [
          {
            order_id: 101,
            total: 100.00,
            date: '2023-01-01',
            products: [{ product_id: 1, value: 100.00 }],
          },
          {
            order_id: 102,
            total: 50.00,
            date: '2023-01-02',
            products: [{ product_id: 2, value: 50.00 }],
          },
        ],
      },
      {
        user_id: 2,
        name: 'User B',
        orders: [
          {
            order_id: 201,
            total: 200.00,
            date: '2023-01-03',
            products: [{ product_id: 3, value: 200.00 }],
          },
        ],
      },
    ];
    await saveParsedData(users);
  });

  afterEach(async () => {
    await closeDbConnection();
  });

  it('should return orders sorted by order_id ascending', async () => {
    const orders = await repository.findOrdersByFilter({ sortBy: 'order_id', sortOrder: 'asc' });
    expect(orders[0].order_id).toBe(101);
    expect(orders[1].order_id).toBe(102);
    expect(orders[2].order_id).toBe(201);
  });

  it('should return orders sorted by order_id descending', async () => {
    const orders = await repository.findOrdersByFilter({ sortBy: 'order_id', sortOrder: 'desc' });
    expect(orders[0].order_id).toBe(201);
    expect(orders[1].order_id).toBe(102);
    expect(orders[2].order_id).toBe(101);
  });

  it('should return orders sorted by total ascending', async () => {
    const orders = await repository.findOrdersByFilter({ sortBy: 'total', sortOrder: 'asc' });
    // Como o total não está diretamente no FlatOrder, vamos verificar a ordem dos order_id
    // que correspondem aos totais esperados.
    expect(orders[0].order_id).toBe(102); // total 50
    expect(orders[1].order_id).toBe(101); // total 100
    expect(orders[2].order_id).toBe(201); // total 200
  });

  it('should return orders sorted by total descending', async () => {
    const orders = await repository.findOrdersByFilter({ sortBy: 'total', sortOrder: 'desc' });
    expect(orders[0].order_id).toBe(201); // total 200
    expect(orders[1].order_id).toBe(101); // total 100
    expect(orders[2].order_id).toBe(102); // total 50
  });

  it('should return orders sorted by date ascending', async () => {
    const orders = await repository.findOrdersByFilter({ sortBy: 'date', sortOrder: 'asc' });
    expect(orders[0].date).toBe('2023-01-01');
    expect(orders[1].date).toBe('2023-01-02');
    expect(orders[2].date).toBe('2023-01-03');
  });

  it('should return orders sorted by date descending', async () => {
    const orders = await repository.findOrdersByFilter({ sortBy: 'date', sortOrder: 'desc' });
    expect(orders[0].date).toBe('2023-01-03');
    expect(orders[1].date).toBe('2023-01-02');
    expect(orders[2].date).toBe('2023-01-01');
  });

  it('should return orders without sorting if sortBy is not provided', async () => {
    const orders = await repository.findOrdersByFilter({});
    // A ordem padrão pode variar dependendo da implementação do SQLite, mas deve retornar todos os pedidos
    expect(orders).toHaveLength(3);
  });
});
