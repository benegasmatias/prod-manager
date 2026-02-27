import { ProductionJob } from '../../jobs/entities/production-job.entity';
export declare class Material {
    id: string;
    name: string;
    productionJobs: ProductionJob[];
}
