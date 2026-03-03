import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessTemplateDto } from './dto/business-template.dto';
import { BusinessMembership } from './entities/business-membership.entity';
import { User } from '../users/entities/user.entity';
import { BusinessTemplate } from './entities/business-template.entity';
import { DataSource } from 'typeorm';
export declare class BusinessesService {
    private readonly businessRepository;
    private readonly membershipRepository;
    private readonly userRepository;
    private readonly templateRepository;
    private readonly dataSource;
    constructor(businessRepository: Repository<Business>, membershipRepository: Repository<BusinessMembership>, userRepository: Repository<User>, templateRepository: Repository<BusinessTemplate>, dataSource: DataSource);
    getTemplates(): Promise<BusinessTemplateDto[]>;
    createFromTemplate(userId: string, templateKey: string): Promise<any>;
    checkAccess(userId: string, businessId: string): Promise<boolean>;
    findUserBusinesses(userId: string): Promise<Business[]>;
}
