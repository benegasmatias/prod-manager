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
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("./entities/business.entity");
const business_membership_entity_1 = require("./entities/business-membership.entity");
const user_entity_1 = require("../users/entities/user.entity");
const business_template_entity_1 = require("./entities/business-template.entity");
const typeorm_3 = require("typeorm");
let BusinessesService = class BusinessesService {
    constructor(businessRepository, membershipRepository, userRepository, templateRepository, dataSource) {
        this.businessRepository = businessRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.templateRepository = templateRepository;
        this.dataSource = dataSource;
    }
    async getTemplates() {
        const templates = await this.templateRepository.find();
        return templates.map(t => ({
            key: t.key,
            name: t.name,
            description: t.description,
            imageKey: t.imageKey,
        }));
    }
    async createFromTemplate(userId, templateKey) {
        const template = await this.templateRepository.findOneBy({ key: templateKey });
        if (!template) {
            throw new common_1.NotFoundException(`Template with key ${templateKey} not found`);
        }
        return await this.dataSource.transaction(async (manager) => {
            const existingMembership = await manager.findOne(business_membership_entity_1.BusinessMembership, {
                where: {
                    userId,
                    business: { category: templateKey }
                },
                relations: ['business']
            });
            let businessToUse = existingMembership?.business;
            if (!businessToUse) {
                console.log(`[Onboarding] Creating new business for user ${userId} [Category: ${templateKey}]`);
                const business = manager.create(business_entity_1.Business, {
                    name: `${template.name} - Mi Espacio`,
                    category: template.key
                });
                businessToUse = await manager.save(business_entity_1.Business, business);
                const membership = manager.create(business_membership_entity_1.BusinessMembership, {
                    userId,
                    businessId: businessToUse.id,
                    role: business_membership_entity_1.UserRole.OWNER
                });
                await manager.save(business_membership_entity_1.BusinessMembership, membership);
            }
            else {
                console.log(`[Onboarding] Reusing existing business ${businessToUse.id} for user ${userId} [Category: ${templateKey}]`);
            }
            const user = await manager.findOneBy(user_entity_1.User, { id: userId });
            if (user) {
                user.defaultBusinessId = businessToUse.id;
                await manager.save(user_entity_1.User, user);
                console.log(`✅ [Onboarding] defaultBusinessId actualizado -> ${businessToUse.id}`);
            }
            return {
                business: {
                    id: businessToUse.id,
                    name: businessToUse.name,
                    category: businessToUse.category
                },
                defaultBusinessId: businessToUse.id
            };
        });
    }
    async checkAccess(userId, businessId) {
        const membership = await this.membershipRepository.findOne({
            where: { userId, businessId }
        });
        return !!membership;
    }
    async findUserBusinesses(userId) {
        const memberships = await this.membershipRepository.find({
            where: { userId },
            relations: ['business']
        });
        return memberships.map(m => m.business);
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(1, (0, typeorm_1.InjectRepository)(business_membership_entity_1.BusinessMembership)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(business_template_entity_1.BusinessTemplate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_3.DataSource])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map