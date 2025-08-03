export interface ProductResponseDto {
  product_id: number;
  value: string;
}

export interface OrderResponseDto {
  order_id: number;
  total: string;
  date: string;
  products: ProductResponseDto[];
}

export interface UserResponseDto {
  user_id: number;
  name: string;
  orders: OrderResponseDto[];
}
