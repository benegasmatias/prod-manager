import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FilesController } from './files.controller';
import { Product } from './entities/product.entity';
import { FileAsset } from './entities/file-asset.entity';
import { ProductFile } from './entities/product-file.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Product, FileAsset, ProductFile])],
    controllers: [ProductsController, FilesController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule { }
