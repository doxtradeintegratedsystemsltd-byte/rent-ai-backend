import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Tenant } from './Tenant';
import { Property } from './Property';
import { LeaseStatus, RentStatus } from '../utils/lease';
import { User } from './User';
import { LeasePayment } from './LeasePayment';

@Entity()
export class Lease {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'text' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'timestamp' })
  startDate: Date | string;

  @Column({ type: 'timestamp' })
  endDate: Date | string;

  @Column({ type: 'text', default: LeaseStatus.ACTIVE })
  leaseStatus: LeaseStatus;

  @Column({ type: 'integer', default: 1 })
  leaseYears: number;

  @Column({ type: 'integer', default: 1 })
  leaseCycles: number;

  @Column({ type: 'float' })
  rentAmount: number;

  @Column({ type: 'text' })
  rentStatus: RentStatus;

  @Column({ type: 'text' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'text', nullable: true })
  paymentId: string;

  @OneToOne(() => LeasePayment)
  @JoinColumn({ name: 'paymentId' })
  payment: LeasePayment;

  @OneToMany(() => LeasePayment, (payment) => payment.lease)
  payments: LeasePayment[];

  @Column({ type: 'text', nullable: true })
  nextLeaseId: string | null;

  @OneToOne(() => Lease)
  @JoinColumn({ name: 'nextLeaseId' })
  nextLease: Lease | null;

  @Column({ type: 'text', nullable: true })
  previousLeaseId: string | null;

  @ManyToOne(() => Lease)
  @JoinColumn({ name: 'previousLeaseId' })
  previousLease: Lease | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
