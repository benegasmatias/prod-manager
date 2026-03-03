import { Controller, Get, Patch, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetDefaultBusinessDto } from './dto/set-default-business.dto';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Controller('me')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async getProfile(@Request() req) {
        return req.user;
    }

    @Patch()
    async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(req.user.id, updateUserDto);
    }

    @Put('default-business')
    async updateDefaultBusiness(@Request() req, @Body() setDefaultBusinessDto: SetDefaultBusinessDto) {
        return this.usersService.setDefaultBusiness(req.user.id, setDefaultBusinessDto.businessId);
    }
}
