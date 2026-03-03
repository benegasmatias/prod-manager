import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MaterialType } from '../../common/enums';
import { ProductionJob } from '../../jobs/entities/production-job.entity';

@Entity('materials')
export class Material {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: MaterialType })
    type: MaterialType;

    @Column({ nullable: true })
    brand: string;

    @Column({ nullable: true })
    color: string;

    @Column({ name: 'cost_per_kg', type: 'decimal', precision: 12, scale: 2, default: 0 })
    costPerKg: number;

    @Column({ default: true })
    active: boolean;

    @OneToMany(() => ProductionJob, (job) => job.material)
    productionJobs: ProductionJob[];
}
