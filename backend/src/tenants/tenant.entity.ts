import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  full_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', nullable: true })
  reset_token!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires!: Date | null;

  @CreateDateColumn()
  created_at!: Date;
}
