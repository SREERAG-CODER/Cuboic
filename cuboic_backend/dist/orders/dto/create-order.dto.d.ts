declare class OrderItemDto {
    item_id: string;
    quantity: number;
}
export declare class CreateOrderDto {
    restaurant_id: string;
    table_id: string;
    customer_session_id: string;
    items: OrderItemDto[];
}
export {};
