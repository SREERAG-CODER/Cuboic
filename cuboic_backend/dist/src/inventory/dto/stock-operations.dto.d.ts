export declare class StockInDto {
    quantity: number;
    costPerUnit?: number;
    referenceId?: string;
    notes?: string;
}
export declare class StockAdjustDto {
    type: 'Wastage' | 'Spoilage' | 'Correction';
    quantity: number;
    notes?: string;
}
