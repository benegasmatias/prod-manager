import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { FileAsset } from './entities/file-asset.entity';
import { ProductFile } from './entities/product-file.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateFileAssetDto, ProductFileDto } from './dto/file.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(FileAsset)
        private readonly fileAssetRepository: Repository<FileAsset>,
        @InjectRepository(ProductFile)
        private readonly productFileRepository: Repository<ProductFile>,
    ) { }

    async create(createProductDto: CreateProductDto) {
        const product = this.productRepository.create(createProductDto);
        return this.productRepository.save(product);
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await this.productRepository.findAndCount({
            skip,
            take: limit,
            relations: ['productFiles', 'productFiles.fileAsset'],
            order: { name: 'ASC' },
        });

        return { items, total, page, limit };
    }

    async findOne(id: string) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['productFiles', 'productFiles.fileAsset'],
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        await this.findOne(id);
        await this.productRepository.update(id, updateProductDto);
        return this.findOne(id);
    }

    async createFileAsset(createFileAssetDto: CreateFileAssetDto) {
        const asset = this.fileAssetRepository.create(createFileAssetDto);
        return this.fileAssetRepository.save(asset);
    }

    async addFileToProduct(productId: string, productFileDto: ProductFileDto) {
        await this.findOne(productId);
        const productFile = this.productFileRepository.create({
            productId,
            fileAssetId: productFileDto.fileAssetId,
            role: productFileDto.role,
        });
        return this.productFileRepository.save(productFile);
    }
}
