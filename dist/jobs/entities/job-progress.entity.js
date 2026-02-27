"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobProgress = void 0;
const typeorm_1 = require("typeorm");
const production_job_entity_1 = require("./production-job.entity");
let JobProgress = class JobProgress {
};
exports.JobProgress = JobProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'production_job_id' }),
    __metadata("design:type", String)
], JobProgress.prototype, "productionJobId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => production_job_entity_1.ProductionJob, (job) => job.progress, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'production_job_id' }),
    __metadata("design:type", production_job_entity_1.ProductionJob)
], JobProgress.prototype, "productionJob", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], JobProgress.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'units_done', type: 'int' }),
    __metadata("design:type", Number)
], JobProgress.prototype, "unitsDone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minutes_done', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], JobProgress.prototype, "minutesDone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weight_used_g', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], JobProgress.prototype, "weightUsedG", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], JobProgress.prototype, "note", void 0);
exports.JobProgress = JobProgress = __decorate([
    (0, typeorm_1.Entity)('job_progress')
], JobProgress);
//# sourceMappingURL=job-progress.entity.js.map