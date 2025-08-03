import { FlatOrder, GetOrdersQuery } from '@/domain/entities/order.entities';

export interface IRepositoryFilters extends Omit<GetOrdersQuery, 'orderId' | 'productId'> {
  orderId?: number;
  productId?: number;
}

export interface IOrderRepository {
  findOrdersByFilter(filters: IRepositoryFilters): Promise<FlatOrder[]>;
}
