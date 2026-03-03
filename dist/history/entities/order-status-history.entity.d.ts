import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums';
export declare class OrderStatusHistory {
    id: string;
    orderId: string;
    order: Order;
    changedAt: Date;
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
    note: string;
}
