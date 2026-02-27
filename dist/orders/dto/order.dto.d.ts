import { OrderStatus } from '../../common/enums';
export declare class CreateOrderDto {
    clientId: string;
    items: any[];
}
export declare class FilterOrderDto {
    status?: OrderStatus;
}
export declare class UpdateOrderDto {
    status?: OrderStatus;
    notes?: string;
}
