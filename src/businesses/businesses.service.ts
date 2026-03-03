import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessTemplateDto } from './dto/business-template.dto';
import { BusinessMembership, UserRole } from './entities/business-membership.entity';
import { User } from '../users/entities/user.entity';
import { BusinessTemplate } from './entities/business-template.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class BusinessesService {
    constructor(
        @InjectRepository(Business)
        private readonly businessRepository: Repository<Business>,
        @InjectRepository(BusinessMembership)
        private readonly membershipRepository: Repository<BusinessMembership>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(BusinessTemplate)
        private readonly templateRepository: Repository<BusinessTemplate>,
        private readonly dataSource: DataSource,
    ) { }

    async getTemplates(): Promise<BusinessTemplateDto[]> {
        const templates = await this.templateRepository.find();
        return templates.map(t => ({
            key: t.key,
            name: t.name,
            description: t.description,
            imageKey: t.imageKey,
        }));
    }

    async createFromTemplate(userId: string, templateKey: string): Promise<any> {
        const template = await this.templateRepository.findOneBy({ key: templateKey });

        if (!template) {
            throw new NotFoundException(`Template with key ${templateKey} not found`);
        }

        return await this.dataSource.transaction(async (manager) => {
            // 1. Buscar si el usuario ya tiene un negocio de esta categoría (Regla A: 1 rubro por user)
            const existingMembership = await manager.findOne(BusinessMembership, {
                where: {
                    userId,
                    business: { category: templateKey }
                },
                relations: ['business']
            });

            let businessToUse = existingMembership?.business;

            if (!businessToUse) {
                console.log(`[Onboarding] Creating new business for user ${userId} [Category: ${templateKey}]`);
                // Crear el negocio
                const business = manager.create(Business, {
                    name: `${template.name} - Mi Espacio`,
                    category: template.key
                });
                businessToUse = await manager.save(Business, business);

                // Crear membership OWNER
                const membership = manager.create(BusinessMembership, {
                    userId,
                    businessId: businessToUse.id,
                    role: UserRole.OWNER
                });
                await manager.save(BusinessMembership, membership);
            } else {
                console.log(`[Onboarding] Reusing existing business ${businessToUse.id} for user ${userId} [Category: ${templateKey}]`);
            }

            // 2. Setear defaultBusinessId en el usuario (Garantizar actualización)
            const user = await manager.findOneBy(User, { id: userId });
            if (user) {
                user.defaultBusinessId = businessToUse.id;
                await manager.save(User, user);
                console.log(`✅ [Onboarding] defaultBusinessId actualizado -> ${businessToUse.id}`);
            }

            // 3. Respuesta estructurada exacta
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

    async checkAccess(userId: string, businessId: string): Promise<boolean> {
        const membership = await this.membershipRepository.findOne({
            where: { userId, businessId }
        });
        return !!membership;
    }

    async findUserBusinesses(userId: string): Promise<Business[]> {
        const memberships = await this.membershipRepository.find({
            where: { userId },
            relations: ['business']
        });
        return memberships.map(m => m.business);
    }
}
