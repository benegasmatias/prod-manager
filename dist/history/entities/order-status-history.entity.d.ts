import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums';
export declare class OrderStatusHistory {
    id: string;
    orderId: string;
    order: Order;
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
    note: string;
    createdAt: Date;
}
