import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Printer } from '../../printers/entities/printer.entity';
import { Material } from '../../materials/entities/material.entity';
import { JobStatus } from '../../common/enums';
import { JobProgress } from './job-progress.entity';
import { JobStatusHistory } from '../../history/entities/job-status-history.entity';
export declare class ProductionJob {
    id: string;
    orderId: string;
    order: Order;
    orderItemId: string;
    orderItem: OrderItem;
    printerId: string;
    printer: Printer;
    materialId: string;
    material: Material;
    title: string;
    totalUnits: number;
    estimatedMinutesTotal: number;
    estimatedWeightGTotal: number;
    scheduledStart: Date;
    dueDate: Date;
    status: JobStatus;
    sortRank: number;
    progress: JobProgress[];
    statusHistory: JobStatusHistory[];
}
