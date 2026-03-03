import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateFileAssetDto, ProductFileDto } from './dto/file.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(page?: number, limit?: number): Promise<{
        items: import("./entities/product.entity").Product[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    addFile(id: string, productFileDto: ProductFileDto): Promise<import("./entities/product-file.entity").ProductFile>;
    createFileAsset(createFileAssetDto: CreateFileAssetDto): Promise<import("./entities/file-asset.entity").FileAsset>;
}
