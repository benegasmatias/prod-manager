import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums';

@Entity('order_status_history')
export class OrderStatusHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.statusHistory, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;

    @Column({ name: 'from_status', type: 'enum', enum: OrderStatus, nullable: true })
    fromStatus: OrderStatus;

    @Column({ name: 'to_status', type: 'enum', enum: OrderStatus })
    toStatus: OrderStatus;

    @Column({ type: 'text', nullable: true })
    note: string;
}
