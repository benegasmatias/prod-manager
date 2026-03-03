import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Business } from './business.entity';
import { User } from '../../users/entities/user.entity';

export enum UserRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
}

@Entity('business_memberships')
@Unique(['userId', 'businessId'])
export class BusinessMembership {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'business_id' })
    businessId: string;

    @ManyToOne(() => Business, (business) => business.memberships)
    @JoinColumn({ name: 'business_id' })
    business: Business;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.MEMBER,
    })
    role: UserRole;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
