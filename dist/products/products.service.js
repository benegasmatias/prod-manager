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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const file_asset_entity_1 = require("./entities/file-asset.entity");
const product_file_entity_1 = require("./entities/product-file.entity");
let ProductsService = class ProductsService {
    constructor(productRepository, fileAssetRepository, productFileRepository) {
        this.productRepository = productRepository;
        this.fileAssetRepository = fileAssetRepository;
        this.productFileRepository = productFileRepository;
    }
    async create(createProductDto) {
        const product = this.productRepository.create(createProductDto);
        return this.productRepository.save(product);
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await this.productRepository.findAndCount({
            skip,
            take: limit,
            relations: ['productFiles', 'productFiles.fileAsset'],
            order: { name: 'ASC' },
        });
        return { items, total, page, limit };
    }
    async findOne(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['productFiles', 'productFiles.fileAsset'],
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(id, updateProductDto) {
        await this.findOne(id);
        await this.productRepository.update(id, updateProductDto);
        return this.findOne(id);
    }
    async createFileAsset(createFileAssetDto) {
        const asset = this.fileAssetRepository.create(createFileAssetDto);
        return this.fileAssetRepository.save(asset);
    }
    async addFileToProduct(productId, productFileDto) {
        await this.findOne(productId);
        const productFile = this.productFileRepository.create({
            productId,
            fileAssetId: productFileDto.fileAssetId,
            role: productFileDto.role,
        });
        return this.productFileRepository.save(productFile);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(file_asset_entity_1.FileAsset)),
    __param(2, (0, typeorm_1.InjectRepository)(product_file_entity_1.ProductFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map