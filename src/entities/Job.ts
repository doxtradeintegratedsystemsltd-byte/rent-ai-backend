import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: any;

  @Column({ type: 'text' })
  schedule: string; // ISO timestamp string for when the job should run

  @Column({ type: 'timestamp' })
  scheduledAt: Date; // The actual scheduled timestamp for the job

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
