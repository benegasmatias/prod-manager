import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, CreateProgressDto, UpdateJobDto } from './dto/job.dto';
import { JobStatus } from '../common/enums';
import { SupabaseAuthGuard } from '../users/guards/supabase-auth.guard';

@Controller('jobs')
@UseGuards(SupabaseAuthGuard)
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    create(@Body() createJobDto: CreateJobDto) {
        return this.jobsService.create(createJobDto);
    }

    @Get('queue')
    getQueue() {
        return this.jobsService.getQueue();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: JobStatus,
        @Body('notes') notes?: string,
    ) {
        return this.jobsService.updateStatus(id, status, notes);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
        return this.jobsService.update(id, updateJobDto);
    }

    @Post(':id/progress')
    addProgress(@Param('id') id: string, @Body() createProgressDto: CreateProgressDto) {
        return this.jobsService.addProgress(id, createProgressDto);
    }
}
