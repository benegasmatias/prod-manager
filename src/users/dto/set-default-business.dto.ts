import { IsUUID } from 'class-validator';

export class SetDefaultBusinessDto {
    @IsUUID()
    businessId: string;
}
