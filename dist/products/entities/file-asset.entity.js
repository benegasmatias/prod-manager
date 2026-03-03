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
exports.FileAsset = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../../common/enums");
const product_file_entity_1 = require("./product-file.entity");
let FileAsset = class FileAsset {
};
exports.FileAsset = FileAsset;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FileAsset.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FileAsset.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FileAsset.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_type', type: 'enum', enum: enums_1.FileType, default: enums_1.FileType.OTHER }),
    __metadata("design:type", String)
], FileAsset.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FileAsset.prototype, "checksum", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'uploaded_at' }),
    __metadata("design:type", Date)
], FileAsset.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_file_entity_1.ProductFile, (pf) => pf.fileAsset),
    __metadata("design:type", Array)
], FileAsset.prototype, "productFiles", void 0);
exports.FileAsset = FileAsset = __decorate([
    (0, typeorm_1.Entity)('file_assets')
], FileAsset);
//# sourceMappingURL=file-asset.entity.js.map