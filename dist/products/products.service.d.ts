import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { FileAsset } from './entities/file-asset.entity';
import { ProductFile } from './entities/product-file.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateFileAssetDto, ProductFileDto } from './dto/file.dto';
export declare class ProductsService {
    private readonly productRepository;
    private readonly fileAssetRepository;
    private readonly productFileRepository;
    constructor(productRepository: Repository<Product>, fileAssetRepository: Repository<FileAsset>, productFileRepository: Repository<ProductFile>);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(page?: number, limit?: number): Promise<{
        items: Product[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    createFileAsset(createFileAssetDto: CreateFileAssetDto): Promise<FileAsset>;
    addFileToProduct(productId: string, productFileDto: ProductFileDto): Promise<ProductFile>;
}
