import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Auth } from './Auth';
import { Tenant } from './Tenant';
import { UserType } from '../utils/authUser';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  firstName: string;

  @Column({ type: 'text' })
  lastName: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  userType: UserType;

  @Column({ type: 'text', nullable: true })
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  phoneNumber: string;

  @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
  auth: Auth;

  @Column({ type: 'text', nullable: true })
  tenantId: string;

  @OneToOne(() => Tenant, { cascade: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
