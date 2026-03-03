import { BusinessesService } from './businesses.service';
import { CreateBusinessFromTemplateDto } from './dto/create-business-from-template.dto';
export declare class BusinessesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    findAll(req: any): Promise<import("./entities/business.entity").Business[]>;
    create(req: any, createDto: CreateBusinessFromTemplateDto): Promise<any>;
}
