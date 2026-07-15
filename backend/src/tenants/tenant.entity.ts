import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  full_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; // stored as a bcrypt hash, never plain text

  @CreateDateColumn()
  created_at!: Date;
}