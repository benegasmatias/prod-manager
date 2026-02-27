import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductionJob } from '../../jobs/entities/production-job.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    productId: string;
    product: Product;
    quantity: number;
    productionJobs: ProductionJob[];
}
