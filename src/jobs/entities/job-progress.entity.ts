import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductionJob } from './production-job.entity';

@Entity('job_progress')
export class JobProgress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'production_job_id' })
    productionJobId: string;

    @ManyToOne(() => ProductionJob, (job) => job.progress, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'production_job_id' })
    productionJob: ProductionJob;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'units_done', type: 'int' })
    unitsDone: number;

    @Column({ name: 'minutes_done', type: 'int', nullable: true })
    minutesDone: number;

    @Column({ name: 'weight_used_g', type: 'float', nullable: true })
    weightUsedG: number;

    @Column({ type: 'text', nullable: true })
    note: string;
}
