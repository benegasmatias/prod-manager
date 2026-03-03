import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { BusinessesService } from '../businesses/businesses.service';
export declare class UsersService {
    private readonly userRepository;
    private readonly businessesService;
    constructor(userRepository: Repository<User>, businessesService: BusinessesService);
    findOne(id: string): Promise<User>;
    findOrCreate(id: string, email: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    setDefaultBusiness(userId: string, businessId: string): Promise<User>;
}
