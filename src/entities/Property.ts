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
import { Location } from './Location';
@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  propertyName: string;

  @Column({ type: 'text', nullable: true })
  propertyState: string;

  @Column({ type: 'text', nullable: true })
  propertyArea: string;

  @Column({ type: 'text', nullable: true })
  propertyAddress: string;

  @Column({ type: 'text', nullable: true })
  propertyImage: string;

  @Column({ type: 'text' })
  createdById: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rentAmount: number;

  @Column({ type: 'integer', default: 1 })
  leaseYears: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'text', nullable: true })
  currentLeaseId: string | null;

  @OneToOne(() => Lease)
  @JoinColumn({ name: 'currentLeaseId' })
  currentLease: Lease;

  @Column({ type: 'text', nullable: true })
  locationId: string | null;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @OneToMany(() => Lease, (lease) => lease.property)
  leases: Lease[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
