import { Controller, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateFileAssetDto } from './dto/file.dto';

@Controller('files')
export class FilesController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() createFileAssetDto: CreateFileAssetDto) {
        return this.productsService.createFileAsset(createFileAssetDto);
    }
}
