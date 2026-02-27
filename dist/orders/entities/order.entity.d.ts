import { OrderItem } from './order-item.entity';
import { ProductionJob } from '../../jobs/entities/production-job.entity';
import { OrderStatusHistory } from '../../history/entities/order-status-history.entity';
import { OrderStatus } from '../../common/enums';
export declare class Order {
    id: string;
    status: OrderStatus;
    clientId: string;
    items: OrderItem[];
    jobs: ProductionJob[];
    statusHistory: OrderStatusHistory[];
    createdAt: Date;
    dueDate: Date;
}
