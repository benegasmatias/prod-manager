import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { JobStatus, Priority } from '../../common/enums';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsString()
    @IsNotEmpty()
    orderItemId: string;

    @IsString()
    @IsOptional()
    printerId?: string;

    @IsString()
    @IsOptional()
    materialId?: string;

    @IsInt()
    @Min(1)
    totalUnits: number;

    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @IsInt()
    @IsOptional()
    sortRank?: number;

    @IsString()
    @IsOptional()
    title?: string;
}

export class UpdateJobDto {
    @IsEnum(JobStatus)
    @IsOptional()
    status?: JobStatus;

    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @IsInt()
    @IsOptional()
    sortRank?: number;

    @IsString()
    @IsOptional()
    printerId?: string;

    @IsString()
    @IsOptional()
    materialId?: string;

    @IsString()
    @IsOptional()
    note?: string; // Changed from notes to note to match entity if needed, but entity has notes in many places. The service complained about 'note'.
}

export class CreateProgressDto {
    @IsInt()
    @Min(1)
    unitsDone: number;

    @IsString()
    @IsOptional()
    note?: string;
}
