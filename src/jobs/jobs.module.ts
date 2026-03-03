import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { OrdersModule } from '../orders/orders.module';
import { ProductionJob } from './entities/production-job.entity';
import { JobProgress } from './entities/job-progress.entity';
import { JobStatusHistory } from '../history/entities/job-status-history.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductionJob, JobProgress, JobStatusHistory]),
        OrdersModule,
    ],
    controllers: [JobsController],
    providers: [JobsService],
})
export class JobsModule { }
