import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../common/enums';
import { ProductionJob } from '../../jobs/entities/production-job.entity';
import { OrderStatusHistory } from '../../history/entities/order-status-history.entity';
import { Payment } from '../../payments/entities/payment.entity';
export declare class Order {
    id: string;
    clientName: string;
    dueDate: Date;
    priority: number;
    status: OrderStatus;
    createdAt: Date;
    items: OrderItem[];
    customerId: string;
    customer: Customer;
    jobs: ProductionJob[];
    statusHistory: OrderStatusHistory[];
    payments: Payment[];
    totalPrice: number;
    notes: string;
    code: string;
}
