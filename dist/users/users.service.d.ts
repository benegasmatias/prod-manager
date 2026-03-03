import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findOne(id: string): Promise<User>;
    findOrCreate(id: string, email: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
}
