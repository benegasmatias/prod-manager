import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductionJob } from './entities/production-job.entity';
import { JobProgress } from './entities/job-progress.entity';
import { JobStatusHistory } from '../history/entities/job-status-history.entity';
import { OrdersService } from '../orders/orders.service';
import { CreateJobDto, CreateProgressDto, UpdateJobDto } from './dto/job.dto';
import { JobStatus, OrderStatus } from '../common/enums';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(ProductionJob)
        private readonly jobRepository: Repository<ProductionJob>,
        @InjectRepository(JobProgress)
        private readonly progressRepository: Repository<JobProgress>,
        @InjectRepository(JobStatusHistory)
        private readonly statusHistoryRepository: Repository<JobStatusHistory>,
        private readonly ordersService: OrdersService,
    ) { }

    async create(createJobDto: CreateJobDto) {
        const job = this.jobRepository.create({
            ...createJobDto,
            status: JobStatus.QUEUED,
        });

        const savedJob = await this.jobRepository.save(job);

        const history = this.statusHistoryRepository.create({
            productionJobId: savedJob.id,
            toStatus: JobStatus.QUEUED,
            note: 'Initial queuing',
        });
        await this.statusHistoryRepository.save(history);

        const fullJob = await this.findOne(savedJob.id);
        const order = fullJob.order;

        // Automatically transition order to IN_PROGRESS if it was CONFIRMED or DRAFT
        if (order.status === OrderStatus.DRAFT || order.status === OrderStatus.CONFIRMED) {
            await this.ordersService.updateStatus(order.id, { status: OrderStatus.IN_PROGRESS, notes: 'Production jobs started.' });
        }

        return fullJob;
    }

    async getQueue() {
        return this.jobRepository.find({
            where: {
                status: In([JobStatus.QUEUED, JobStatus.PRINTING, JobStatus.PAUSED]),
            },
            relations: ['order', 'orderItem', 'orderItem.product', 'printer', 'material'],
            order: {
                order: { priority: 'DESC' },
                dueDate: 'ASC',
                sortRank: 'ASC',
            },
        });
    }

    async findOne(id: string) {
        const job = await this.jobRepository.findOne({
            where: { id },
            relations: [
                'order',
                'orderItem',
                'orderItem.product',
                'progress',
                'statusHistory',
            ],
        });
        if (!job) throw new NotFoundException('Job not found');
        return job;
    }

    async updateStatus(id: string, status: JobStatus, note?: string) {
        const job = await this.findOne(id);
        const oldStatus = job.status;

        await this.jobRepository.update(id, { status });

        const history = this.statusHistoryRepository.create({
            productionJobId: id,
            fromStatus: oldStatus,
            toStatus: status,
            note,
        });
        await this.statusHistoryRepository.save(history);

        if (status === JobStatus.DONE) {
            // await this.ordersService.checkAndSetReadyStatus(job.orderId);
        }

        return this.findOne(id);
    }

    async update(id: string, updateJobDto: UpdateJobDto) {
        const { status, note, ...data } = updateJobDto;

        if (status) {
            return this.updateStatus(id, status, note);
        }

        if (Object.keys(data).length > 0) {
            await this.jobRepository.update(id, data);
        }

        return this.findOne(id);
    }

    async addProgress(id: string, createProgressDto: CreateProgressDto) {
        const job = await this.findOne(id);

        // Total units done so far
        const currentUnitsDone = job.progress.reduce((sum, p) => sum + p.unitsDone, 0);

        if (currentUnitsDone + createProgressDto.unitsDone > job.totalUnits) {
            throw new BadRequestException('Total completed units cannot exceed job requirements');
        }

        const progress = this.progressRepository.create({
            productionJobId: id,
            ...createProgressDto
        });
        await this.progressRepository.save(progress);

        const updatedUnitsDone = currentUnitsDone + createProgressDto.unitsDone;

        if (updatedUnitsDone === job.totalUnits) {
            await this.updateStatus(id, JobStatus.DONE, 'Completion reported via progress update.');
        }

        return this.findOne(id);
    }
}
