import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { UsersService } from '../users.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
    constructor(
        private supabaseService: SupabaseService,
        private usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('No authorization header found');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('No token found');
        }

        const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);

        if (error || !user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Asegurarse de que el perfil de usuario exista en nuestra base de datos
        const profile = await this.usersService.findOrCreate(user.id, user.email);

        // Adjuntar el usuario al objeto request
        request.user = profile;

        return true;
    }
}
