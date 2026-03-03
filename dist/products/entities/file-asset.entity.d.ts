import { FileType } from '../../common/enums';
import { ProductFile } from './product-file.entity';
export declare class FileAsset {
    id: string;
    name: string;
    url: string;
    fileType: FileType;
    checksum: string;
    uploadedAt: Date;
    productFiles: ProductFile[];
}
