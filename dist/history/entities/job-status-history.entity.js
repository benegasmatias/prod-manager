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
exports.JobStatusHistory = void 0;
const typeorm_1 = require("typeorm");
const production_job_entity_1 = require("../../jobs/entities/production-job.entity");
const enums_1 = require("../../common/enums");
let JobStatusHistory = class JobStatusHistory {
};
exports.JobStatusHistory = JobStatusHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobStatusHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'production_job_id' }),
    __metadata("design:type", String)
], JobStatusHistory.prototype, "productionJobId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => production_job_entity_1.ProductionJob, (job) => job.statusHistory, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'production_job_id' }),
    __metadata("design:type", production_job_entity_1.ProductionJob)
], JobStatusHistory.prototype, "productionJob", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'changed_at' }),
    __metadata("design:type", Date)
], JobStatusHistory.prototype, "changedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_status', type: 'enum', enum: enums_1.JobStatus, nullable: true }),
    __metadata("design:type", String)
], JobStatusHistory.prototype, "fromStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_status', type: 'enum', enum: enums_1.JobStatus }),
    __metadata("design:type", String)
], JobStatusHistory.prototype, "toStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], JobStatusHistory.prototype, "note", void 0);
exports.JobStatusHistory = JobStatusHistory = __decorate([
    (0, typeorm_1.Entity)('job_status_history')
], JobStatusHistory);
//# sourceMappingURL=job-status-history.entity.js.map