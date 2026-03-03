import { Business } from './business.entity';
import { User } from '../../users/entities/user.entity';
export declare enum UserRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare class BusinessMembership {
    id: string;
    userId: string;
    user: User;
    businessId: string;
    business: Business;
    role: UserRole;
    createdAt: Date;
}
