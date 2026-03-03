import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { ProductFile } from './product-file.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'default_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
    defaultPrice: number;

    @Column({ name: 'default_weight_g', type: 'float', nullable: true })
    defaultWeightG: number;

    @Column({ name: 'default_estimated_minutes', type: 'int', nullable: true })
    defaultEstimatedMinutes: number;

    @Column({ default: true })
    active: boolean;

    @OneToMany(() => OrderItem, (item) => item.product)
    orderItems: OrderItem[];

    @OneToMany(() => ProductFile, (file) => file.product)
    productFiles: ProductFile[];
}
