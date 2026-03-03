import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductionJob } from '../../jobs/entities/production-job.entity';

@Entity('printers')
export class Printer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    model: string;

    @Column({ nullable: true })
    nozzle: string;

    @Column({ default: true })
    active: boolean;

    @OneToMany(() => ProductionJob, (job) => job.printer)
    productionJobs: ProductionJob[];
}
