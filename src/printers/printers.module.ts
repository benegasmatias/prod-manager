import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Printer } from './entities/printer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Printer])],
    controllers: [],
    providers: [],
    exports: [TypeOrmModule],
})
export class PrintersModule { }
