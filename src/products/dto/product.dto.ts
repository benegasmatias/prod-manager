import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    basePrice: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    estimatedDuration?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    weight?: number;
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    basePrice?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    estimatedDuration?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    weight?: number;
}
