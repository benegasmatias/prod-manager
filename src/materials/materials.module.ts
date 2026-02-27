import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Material])],
    controllers: [],
    providers: [],
    exports: [TypeOrmModule],
})
export class MaterialsModule { }
