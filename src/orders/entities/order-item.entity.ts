import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductionJob } from '../../jobs/entities/production-job.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.items)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'product_id', nullable: true })
    productId: string;

    @ManyToOne(() => Product, (product) => product.orderItems, { nullable: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column()
    quantity: number;

    @OneToMany(() => ProductionJob, (job) => job.orderItem)
    productionJobs: ProductionJob[];
}
