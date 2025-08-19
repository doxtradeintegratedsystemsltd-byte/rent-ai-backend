import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Lease } from './Lease';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  firstName: string;

  @Column({ type: 'text' })
  lastName: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  phoneNumber: string;

  @Column({ type: 'text' })
  levelOfEducation: string;

  @OneToOne(() => User, (user) => user.tenant)
  user: User;

  @Column({ type: 'text' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'text', nullable: true })
  currentLeaseId: string | null;

  @OneToOne(() => Lease)
  @JoinColumn({ name: 'currentLeaseId' })
  currentLease: Lease;

  @OneToMany(() => Lease, (lease) => lease.tenant)
  leases: Lease[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
