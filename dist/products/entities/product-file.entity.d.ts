import { Product } from './product.entity';
import { FileAsset } from './file-asset.entity';
import { ProductFileRole } from '../../common/enums';
export declare class ProductFile {
    id: string;
    productId: string;
    product: Product;
    fileAssetId: string;
    fileAsset: FileAsset;
    role: ProductFileRole;
}
