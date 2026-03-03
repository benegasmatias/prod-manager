import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from '../../common/enums';
export declare class Payment {
    id: string;
    orderId: string;
    order: Order;
    paidAt: Date;
    amount: number;
    method: PaymentMethod;
    reference: string;
    note: string;
}
