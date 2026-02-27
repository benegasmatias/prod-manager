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
exports.ProductionJob = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("../../orders/entities/order.entity");
const order_item_entity_1 = require("../../orders/entities/order-item.entity");
const printer_entity_1 = require("../../printers/entities/printer.entity");
const material_entity_1 = require("../../materials/entities/material.entity");
const enums_1 = require("../../common/enums");
const job_progress_entity_1 = require("./job-progress.entity");
const job_status_history_entity_1 = require("../../history/entities/job-status-history.entity");
let ProductionJob = class ProductionJob {
};
exports.ProductionJob = ProductionJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProductionJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id' }),
    __metadata("design:type", String)
], ProductionJob.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.jobs),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", order_entity_1.Order)
], ProductionJob.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_item_id' }),
    __metadata("design:type", String)
], ProductionJob.prototype, "orderItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_item_entity_1.OrderItem, (item) => item.productionJobs),
    (0, typeorm_1.JoinColumn)({ name: 'order_item_id' }),
    __metadata("design:type", order_item_entity_1.OrderItem)
], ProductionJob.prototype, "orderItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'printer_id', nullable: true }),
    __metadata("design:type", String)
], ProductionJob.prototype, "printerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => printer_entity_1.Printer, (printer) => printer.productionJobs, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'printer_id' }),
    __metadata("design:type", printer_entity_1.Printer)
], ProductionJob.prototype, "printer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'material_id', nullable: true }),
    __metadata("design:type", String)
], ProductionJob.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => material_entity_1.Material, (material) => material.productionJobs, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'material_id' }),
    __metadata("design:type", material_entity_1.Material)
], ProductionJob.prototype, "material", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProductionJob.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_units' }),
    __metadata("design:type", Number)
], ProductionJob.prototype, "totalUnits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_minutes_total', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ProductionJob.prototype, "estimatedMinutesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_weight_g_total', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], ProductionJob.prototype, "estimatedWeightGTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_start', nullable: true }),
    __metadata("design:type", Date)
], ProductionJob.prototype, "scheduledStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', nullable: true }),
    __metadata("design:type", Date)
], ProductionJob.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.JobStatus, default: enums_1.JobStatus.QUEUED }),
    __metadata("design:type", String)
], ProductionJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_rank', default: 0 }),
    __metadata("design:type", Number)
], ProductionJob.prototype, "sortRank", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.Priority, default: enums_1.Priority.NORMAL }),
    __metadata("design:type", String)
], ProductionJob.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProductionJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_progress_entity_1.JobProgress, (progress) => progress.productionJob),
    __metadata("design:type", Array)
], ProductionJob.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_status_history_entity_1.JobStatusHistory, (history) => history.productionJob),
    __metadata("design:type", Array)
], ProductionJob.prototype, "statusHistory", void 0);
exports.ProductionJob = ProductionJob = __decorate([
    (0, typeorm_1.Entity)('production_jobs')
], ProductionJob);
//# sourceMappingURL=production-job.entity.js.map