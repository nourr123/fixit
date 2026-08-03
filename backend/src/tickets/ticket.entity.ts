import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  tenant_name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tenant_email!: string | null;

  // null = submitted as a guest, no account. Filled = linked to a real tenant account.
  @Column({ type: 'int', nullable: true })
  tenant_id!: number | null;

  @Column({ length: 50 })
  unit_number!: string;

  @Column('text')
  description!: string;

  @Column({ length: 10 })
  priority!: string;

  @Column({ length: 20, default: 'Open' })
  status!: string;

  @Column({ default: false })
  needs_review!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
