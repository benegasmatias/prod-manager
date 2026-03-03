import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductionJob } from '../../jobs/entities/production-job.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    name: string;
    description: string;
    stlUrl: string;
    estimatedMinutes: number;
    weightGrams: number;
    price: number;
    qty: number;
    doneQty: number;
    productId: string;
    product: Product;
    productionJobs: ProductionJob[];
    unitPrice: number;
    subtotal: number;
    notes: string;
}
