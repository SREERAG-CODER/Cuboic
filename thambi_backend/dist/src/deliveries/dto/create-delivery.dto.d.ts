declare class DeliveryStopDto {
    orderId: string;
    tableId: string;
    cabinets: string[];
    sequence: number;
}
export declare class CreateDeliveryDto {
    restaurantId: string;
    robotId: string;
    stops: DeliveryStopDto[];
}
export {};
