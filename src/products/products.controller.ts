import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateFileAssetDto, ProductFileDto } from './dto/file.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.productsService.findAll(Number(page) || 1, Number(limit) || 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Post(':id/files')
    addFile(@Param('id') id: string, @Body() productFileDto: ProductFileDto) {
        return this.productsService.addFileToProduct(id, productFileDto);
    }

    @Post('assets/files')
    createFileAsset(@Body() createFileAssetDto: CreateFileAssetDto) {
        return this.productsService.createFileAsset(createFileAssetDto);
    }
}
