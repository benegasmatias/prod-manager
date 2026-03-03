import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBusinessFromTemplateDto {
    @IsNotEmpty()
    @IsString()
    templateKey: string;
}
