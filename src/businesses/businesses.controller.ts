import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { SupabaseAuthGuard } from '../users/guards/supabase-auth.guard';
import { CreateBusinessFromTemplateDto } from './dto/create-business-from-template.dto';

@Controller('businesses')
@UseGuards(SupabaseAuthGuard)
export class BusinessesController {
    constructor(private readonly businessesService: BusinessesService) { }

    @Get()
    async findAll(@Request() req) {
        return this.businessesService.findUserBusinesses(req.user.id);
    }

    @Post()
    async create(@Request() req, @Body() createDto: CreateBusinessFromTemplateDto) {
        return this.businessesService.createFromTemplate(req.user.id, createDto.templateKey);
    }
}
