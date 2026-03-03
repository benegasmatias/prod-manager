import { Controller, Get, UseGuards } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { SupabaseAuthGuard } from '../users/guards/supabase-auth.guard';
import { BusinessTemplateDto } from './dto/business-template.dto';

@Controller('business-templates')
@UseGuards(SupabaseAuthGuard)
export class BusinessTemplatesController {
    constructor(private readonly businessesService: BusinessesService) { }

    @Get()
    async getTemplates(): Promise<BusinessTemplateDto[]> {
        return await this.businessesService.getTemplates();
    }
}
