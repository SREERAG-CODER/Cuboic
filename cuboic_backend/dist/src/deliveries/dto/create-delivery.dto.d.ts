declare class DeliveryStopDto {
    order_id: string;
    table_id: string;
    cabinets: string[];
    sequence: number;
}
export declare class CreateDeliveryDto {
    restaurant_id: string;
    robot_id: string;
    stops: DeliveryStopDto[];
}
export {};
