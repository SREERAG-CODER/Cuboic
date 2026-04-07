export declare class CreateInventoryItemDto {
    outletId: string;
    name: string;
    unit: string;
    category?: string;
    currentStock?: number;
    costPerUnit?: number;
    reorderLevel?: number;
}
