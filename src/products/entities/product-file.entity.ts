import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { FileAsset } from './file-asset.entity';
import { ProductFileRole } from '../../common/enums';

@Entity('product_files')
export class ProductFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'product_id' })
    productId: string;

    @ManyToOne(() => Product, (product) => product.productFiles)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'file_asset_id' })
    fileAssetId: string;

    @ManyToOne(() => FileAsset, (asset) => asset.productFiles)
    @JoinColumn({ name: 'file_asset_id' })
    fileAsset: FileAsset;

    @Column({ type: 'enum', enum: ProductFileRole, default: ProductFileRole.MODEL })
    role: ProductFileRole;
}
