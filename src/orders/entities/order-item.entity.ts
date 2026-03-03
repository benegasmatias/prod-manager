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

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'stl_url', nullable: true })
    stlUrl: string;

    @Column({ name: 'estimated_minutes', type: 'int', default: 0 })
    estimatedMinutes: number;

    @Column({ name: 'weight_grams', type: 'float', default: 0 })
    weightGrams: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    price: number;

    @Column({ type: 'int', default: 1 })
    qty: number;

    @Column({ name: 'done_qty', type: 'int', default: 0 })
    doneQty: number;

    // --- Technical relationships / compatibility ---

    @Column({ name: 'product_id', nullable: true })
    productId: string;

    @ManyToOne(() => Product, (product) => product.orderItems, { nullable: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @OneToMany(() => ProductionJob, (job) => job.orderItem)
    productionJobs: ProductionJob[];

    @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    subtotal: number;

    @Column({ type: 'text', nullable: true })
    notes: string;
}
