import { ProductsService } from './products.service';
import { CreateFileAssetDto } from './dto/file.dto';
export declare class FilesController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createFileAssetDto: CreateFileAssetDto): Promise<import("./entities/file-asset.entity").FileAsset>;
}
