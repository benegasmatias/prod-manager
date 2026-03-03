import { MaterialType } from '../../common/enums';
import { ProductionJob } from '../../jobs/entities/production-job.entity';
export declare class Material {
    id: string;
    name: string;
    type: MaterialType;
    brand: string;
    color: string;
    costPerKg: number;
    active: boolean;
    productionJobs: ProductionJob[];
}
