import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductionJob } from '../../jobs/entities/production-job.entity';

@Entity('printers')
export class Printer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @OneToMany(() => ProductionJob, (job) => job.printer)
    productionJobs: ProductionJob[];
}
