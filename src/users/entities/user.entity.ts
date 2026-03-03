import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryColumn('uuid')
    id: string; // Este será el 'sub' de Supabase Auth

    @Column({ unique: true })
    email: string;

    @Column({ name: 'full_name', nullable: true })
    fullName: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
