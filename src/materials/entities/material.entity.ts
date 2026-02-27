import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductionJob } from '../../jobs/entities/production-job.entity';

@Entity('materials')
export class Material {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @OneToMany(() => ProductionJob, (job) => job.material)
    productionJobs: ProductionJob[];
}
