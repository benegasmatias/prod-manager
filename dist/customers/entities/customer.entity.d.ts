import { Order } from '../../orders/entities/order.entity';
export declare class Customer {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    notes: string;
    createdAt: Date;
    orders: Order[];
}
