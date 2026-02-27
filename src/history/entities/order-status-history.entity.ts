import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums';

@Entity('order_status_history')
export class OrderStatusHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.statusHistory)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ type: 'enum', enum: OrderStatus, nullable: true })
    fromStatus: OrderStatus;

    @Column({ type: 'enum', enum: OrderStatus })
    toStatus: OrderStatus;

    @Column({ nullable: true })
    note: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
