import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Printer } from '../../printers/entities/printer.entity';
import { Material } from '../../materials/entities/material.entity';
import { JobStatus } from '../../common/enums';
import { JobProgress } from './job-progress.entity';
import { JobStatusHistory } from '../../history/entities/job-status-history.entity';

@Entity('production_jobs')
export class ProductionJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.jobs)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'order_item_id' })
    orderItemId: string;

    @ManyToOne(() => OrderItem, (item) => item.productionJobs)
    @JoinColumn({ name: 'order_item_id' })
    orderItem: OrderItem;

    @Column({ name: 'printer_id', nullable: true })
    printerId: string;

    @ManyToOne(() => Printer, (printer) => printer.productionJobs, { nullable: true })
    @JoinColumn({ name: 'printer_id' })
    printer: Printer;

    @Column({ name: 'material_id', nullable: true })
    materialId: string;

    @ManyToOne(() => Material, (material) => material.productionJobs, { nullable: true })
    @JoinColumn({ name: 'material_id' })
    material: Material;

    @Column()
    title: string;

    @Column({ name: 'total_units' })
    totalUnits: number;

    @Column({ name: 'estimated_minutes_total', type: 'int', nullable: true })
    estimatedMinutesTotal: number;

    @Column({ name: 'estimated_weight_g_total', type: 'float', nullable: true })
    estimatedWeightGTotal: number;

    @Column({ name: 'scheduled_start', nullable: true })
    scheduledStart: Date;

    @Column({ name: 'due_date', nullable: true })
    dueDate: Date;

    @Column({ type: 'enum', enum: JobStatus, default: JobStatus.QUEUED })
    status: JobStatus;

    @Column({ name: 'sort_rank', default: 0 })
    sortRank: number;

    @OneToMany(() => JobProgress, (progress) => progress.productionJob)
    progress: JobProgress[];

    @OneToMany(() => JobStatusHistory, (history) => history.productionJob)
    statusHistory: JobStatusHistory[];
}
