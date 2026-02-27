import { OrderStatus } from '../../common/enums';

export class CreateOrderDto {
    clientId: string;
    items: any[];
}

export class FilterOrderDto {
    status?: OrderStatus;
}

export class UpdateOrderDto {
    status?: OrderStatus;
    notes?: string;
}
