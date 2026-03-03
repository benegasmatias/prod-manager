import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessMembership } from './entities/business-membership.entity';
import { BusinessTemplate } from './entities/business-template.entity';
import { User } from '../users/entities/user.entity';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { BusinessTemplatesController } from './business-templates.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Business, BusinessMembership, User, BusinessTemplate])],
    controllers: [BusinessesController, BusinessTemplatesController],
    providers: [BusinessesService],
    exports: [BusinessesService],
})
export class BusinessesModule { }
