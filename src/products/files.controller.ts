import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateFileAssetDto } from './dto/file.dto';
import { SupabaseAuthGuard } from '../users/guards/supabase-auth.guard';

@Controller('files')
@UseGuards(SupabaseAuthGuard)
export class FilesController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() createFileAssetDto: CreateFileAssetDto) {
        return this.productsService.createFileAsset(createFileAssetDto);
    }
}
