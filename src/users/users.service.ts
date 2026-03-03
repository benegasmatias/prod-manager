import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { BusinessesService } from '../businesses/businesses.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly businessesService: BusinessesService,
    ) { }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findOrCreate(id: string, email: string): Promise<User> {
        let user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            user = this.userRepository.create({ id, email });
            await this.userRepository.save(user);
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async setDefaultBusiness(userId: string, businessId: string): Promise<User> {
        const hasAccess = await this.businessesService.checkAccess(userId, businessId);
        if (!hasAccess) {
            throw new ForbiddenException(`User does not have access to business ${businessId}`);
        }

        const user = await this.findOne(userId);
        user.defaultBusinessId = businessId;
        return this.userRepository.save(user);
    }
}
