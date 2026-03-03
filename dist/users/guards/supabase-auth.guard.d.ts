import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { UsersService } from '../users.service';
export declare class SupabaseAuthGuard implements CanActivate {
    private supabaseService;
    private usersService;
    constructor(supabaseService: SupabaseService, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
