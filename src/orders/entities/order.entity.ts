import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { ProductionJob } from '../../jobs/entities/production-job.entity';
import { OrderStatusHistory } from '../../history/entities/order-status-history.entity';
import { OrderStatus } from '../../common/enums';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT })
    status: OrderStatus;

    @Column()
    clientId: string;

    @OneToMany(() => OrderItem, (item) => item.order)
    items: OrderItem[];

    @OneToMany(() => ProductionJob, (job) => job.order)
    jobs: ProductionJob[];

    @OneToMany(() => OrderStatusHistory, (history) => history.order)
    statusHistory: OrderStatusHistory[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'due_date', nullable: true })
    dueDate: Date;
}
