import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; // stored as a bcrypt hash, never plain text

  @CreateDateColumn()
  created_at!: Date;
}
