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
exports.ProductFile = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const file_asset_entity_1 = require("./file-asset.entity");
const enums_1 = require("../../common/enums");
let ProductFile = class ProductFile {
};
exports.ProductFile = ProductFile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProductFile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", String)
], ProductFile.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.productFiles),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], ProductFile.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_asset_id' }),
    __metadata("design:type", String)
], ProductFile.prototype, "fileAssetId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_asset_entity_1.FileAsset, (asset) => asset.productFiles),
    (0, typeorm_1.JoinColumn)({ name: 'file_asset_id' }),
    __metadata("design:type", file_asset_entity_1.FileAsset)
], ProductFile.prototype, "fileAsset", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.ProductFileRole, default: enums_1.ProductFileRole.MODEL }),
    __metadata("design:type", String)
], ProductFile.prototype, "role", void 0);
exports.ProductFile = ProductFile = __decorate([
    (0, typeorm_1.Entity)('product_files')
], ProductFile);
//# sourceMappingURL=product-file.entity.js.map