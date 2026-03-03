import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from '../../common/enums';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.payments)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @CreateDateColumn({ name: 'paid_at' })
    paidAt: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentMethod })
    method: PaymentMethod;

    @Column({ nullable: true })
    reference: string;

    @Column({ type: 'text', nullable: true })
    note: string;
}
