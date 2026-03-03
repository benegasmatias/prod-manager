import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductionJob } from '../../jobs/entities/production-job.entity';
import { JobStatus } from '../../common/enums';

@Entity('job_status_history')
export class JobStatusHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'production_job_id' })
    productionJobId: string;

    @ManyToOne(() => ProductionJob, (job) => job.statusHistory, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'production_job_id' })
    productionJob: ProductionJob;

    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;

    @Column({ name: 'from_status', type: 'enum', enum: JobStatus, nullable: true })
    fromStatus: JobStatus;

    @Column({ name: 'to_status', type: 'enum', enum: JobStatus })
    toStatus: JobStatus;

    @Column({ type: 'text', nullable: true })
    note: string;
}
