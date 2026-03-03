import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../common/enums';
import { ProductionJob } from '../../jobs/entities/production-job.entity';
import { OrderStatusHistory } from '../../history/entities/order-status-history.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'business_id', nullable: true })
    businessId: string;

    @ManyToOne(() => Business)
    @JoinColumn({ name: 'business_id' })
    business: Business;

    @Column({ name: 'client_name', nullable: true })
    clientName: string;

    @Column({ name: 'due_date' })
    dueDate: Date;

    @Column({ type: 'int', default: 1 })
    priority: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    status: OrderStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // --- Relationships (kept for compatibility and app integrity) ---

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @Column({ name: 'customer_id', nullable: true })
    customerId: string;

    @ManyToOne(() => Customer, (customer) => customer.orders)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @OneToMany(() => ProductionJob, (job) => job.order)
    jobs: ProductionJob[];

    @OneToMany(() => OrderStatusHistory, (history) => history.order)
    statusHistory: OrderStatusHistory[];

    @OneToMany(() => Payment, (payment) => payment.order)
    payments: Payment[];

    @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalPrice: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ unique: true, nullable: true })
    code: string;
}
