import { OrderItem } from '../../orders/entities/order-item.entity';
import { ProductFile } from './product-file.entity';
export declare class Product {
    id: string;
    name: string;
    description: string;
    defaultPrice: number;
    defaultWeightG: number;
    defaultEstimatedMinutes: number;
    active: boolean;
    orderItems: OrderItem[];
    productFiles: ProductFile[];
}
