import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../utils/notification';
import { User } from './User';
import { UserType } from '../utils/authUser';
import { Property } from './Property';
import { Lease } from './Lease';
import { Tenant } from './Tenant';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  userType: UserType;

  @Column({ type: 'text' })
  notificationType: NotificationType;

  @Column({ type: 'text' })
  notificationChannel: NotificationChannel;

  @Column({ type: 'text' })
  status: NotificationStatus;

  @Column({ type: 'boolean', default: false })
  seen: boolean;

  @Column({ type: 'jsonb', nullable: true })
  data?: any;

  @Column({ type: 'text', nullable: true })
  adminId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column({ type: 'text', nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'text', nullable: true })
  leaseId: string;

  @ManyToOne(() => Lease)
  @JoinColumn({ name: 'leaseId' })
  lease: Lease;

  @Column({ type: 'text', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
