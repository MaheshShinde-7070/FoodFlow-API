export interface CreateOrderItem {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrder {
  restaurantId: number;
  deliveryAddress: string;
  items: CreateOrderItem[];
}