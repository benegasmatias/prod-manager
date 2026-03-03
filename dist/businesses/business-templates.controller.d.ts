import { BusinessesService } from './businesses.service';
import { BusinessTemplateDto } from './dto/business-template.dto';
export declare class BusinessTemplatesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    getTemplates(): Promise<BusinessTemplateDto[]>;
}
