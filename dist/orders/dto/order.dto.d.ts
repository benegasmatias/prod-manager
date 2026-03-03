import { OrderStatus } from '../../common/enums';
export declare class CreateOrderItemDto {
    name: string;
    description?: string;
    stlUrl?: string;
    estimatedMinutes: number;
    weightGrams: number;
    price: number;
    qty: number;
}
export declare class CreateOrderDto {
    clientName: string;
    dueDate: Date;
    priority: number;
    items: CreateOrderItemDto[];
}
export declare class UpdateProgressDto {
    doneQty: number;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    notes?: string;
}
