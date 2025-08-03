import { User, Order, Product } from '@/domain/entities/order.entities';
import { UserResponseDto, OrderResponseDto, ProductResponseDto } from '@/api/dtos/order.response.dto';

export const toUserResponseDto = (user: User): UserResponseDto => {
  return {
    user_id: user.user_id,
    name: user.name,
    orders: user.orders.map(toOrderResponseDto),
  };
};

export const toOrderResponseDto = (order: Order): OrderResponseDto => {
  return {
    order_id: order.order_id,
    total: order.total.toFixed(2),
    date: order.date,
    products: order.products.map(toProductResponseDto),
  };
};

export const toProductResponseDto = (product: Product): ProductResponseDto => {
  return {
    product_id: product.product_id,
    value: product.value.toFixed(2),
  };
};

export const toUsersResponseDto = (users: User[]): UserResponseDto[] => {
  return users.map(toUserResponseDto);
};
