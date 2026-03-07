declare class OrderItemDto {
    itemId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    restaurantId: string;
    tableId: string;
    customerSessionId: string;
    items: OrderItemDto[];
}
export {};
