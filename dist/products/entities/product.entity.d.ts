import { OrderItem } from '../../orders/entities/order-item.entity';
export declare class Product {
    id: string;
    name: string;
    orderItems: OrderItem[];
}
