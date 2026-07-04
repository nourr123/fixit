import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  tenant_name!: string;

  @Column({ length: 50 })
  unit_number!: string;

  @Column('text')
  description!: string;

  @Column({ length: 10 })
  priority!: string;

  @Column({ length: 20, default: 'Open' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;
}