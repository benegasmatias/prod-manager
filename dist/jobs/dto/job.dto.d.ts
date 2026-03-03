import { JobStatus, Priority } from '../../common/enums';
export declare class CreateJobDto {
    orderId: string;
    orderItemId: string;
    printerId?: string;
    materialId?: string;
    totalUnits: number;
    priority?: Priority;
    sortRank?: number;
    title?: string;
}
export declare class UpdateJobDto {
    status?: JobStatus;
    priority?: Priority;
    sortRank?: number;
    printerId?: string;
    materialId?: string;
    note?: string;
}
export declare class CreateProgressDto {
    unitsDone: number;
    note?: string;
}
