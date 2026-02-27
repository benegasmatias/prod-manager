import { JobStatus, Priority } from '../../common/enums';
export declare class CreateJobDto {
    orderId: string;
    orderItemId: string;
    printerId?: string;
    materialId?: string;
    title: string;
    totalUnits: number;
    estimatedMinutesTotal?: number;
    estimatedWeightGTotal?: number;
    scheduledStart?: Date;
    dueDate?: Date;
    sortRank?: number;
    priority?: Priority;
}
export declare class UpdateJobDto {
    status?: JobStatus;
    note?: string;
    title?: string;
    printerId?: string;
    materialId?: string;
}
export declare class CreateProgressDto {
    unitsDone: number;
    notes?: string;
}
