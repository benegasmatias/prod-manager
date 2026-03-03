import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SupabaseService } from '../common/supabase/supabase.service';

import { BusinessesModule } from '../businesses/businesses.module';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        BusinessesModule,
    ],
    controllers: [UsersController],
    providers: [UsersService, SupabaseService],
    exports: [UsersService, SupabaseService, TypeOrmModule],
})
export class UsersModule { }
