import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetDefaultBusinessDto } from './dto/set-default-business.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    updateDefaultBusiness(req: any, setDefaultBusinessDto: SetDefaultBusinessDto): Promise<import("./entities/user.entity").User>;
}
