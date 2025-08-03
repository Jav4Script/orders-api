export interface FlatOrder {
  user_id: number;
  name: string;
  order_id: number;
  date: string;
  product_id: number;
  value: number;
}

export interface Product {
  product_id: number;
  value: number;
}

export interface Order {
  order_id: number;
  total: number;
  date: string;
  products: Product[];
}

export interface User {
  user_id: number;
  name: string;
  orders: Order[];
}

export interface GetOrdersQuery {
  orderId?: string;
  startDate?: string;
  endDate?: string;
  productId?: string;
  sortBy?: 'order_id' | 'total' | 'date';
  sortOrder?: 'asc' | 'desc';
}
