import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { Lease } from './Lease';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  propertyName: string;

  @Column({ type: 'text' })
  propertyState: string;

  @Column({ type: 'text' })
  propertyArea: string;

  @Column({ type: 'text' })
  propertyAddress: string;

  @Column({ type: 'text', nullable: true })
  propertyImage: string;

  @Column({ type: 'text' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'text', nullable: true })
  currentLeaseId: string;

  @OneToOne(() => Lease)
  @JoinColumn({ name: 'currentLeaseId' })
  currentLease: Lease;

  @OneToMany(() => Lease, (lease) => lease.property)
  leases: Lease[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
