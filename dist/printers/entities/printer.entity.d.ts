import { ProductionJob } from '../../jobs/entities/production-job.entity';
export declare class Printer {
    id: string;
    name: string;
    model: string;
    nozzle: string;
    active: boolean;
    productionJobs: ProductionJob[];
}
