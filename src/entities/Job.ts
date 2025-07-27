import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: any;

  @Column({ type: 'text' })
  schedule: string; // Cron expression or one-time timestamp

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'text' })
  jobStatus: string;

  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
