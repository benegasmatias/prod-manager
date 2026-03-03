import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { FileType } from '../../common/enums';
import { ProductFile } from './product-file.entity';

@Entity('file_assets')
export class FileAsset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column({ name: 'file_type', type: 'enum', enum: FileType, default: FileType.OTHER })
    fileType: FileType;

    @Column({ nullable: true })
    checksum: string;

    @CreateDateColumn({ name: 'uploaded_at' })
    uploadedAt: Date;

    @OneToMany(() => ProductFile, (pf) => pf.fileAsset)
    productFiles: ProductFile[];
}
