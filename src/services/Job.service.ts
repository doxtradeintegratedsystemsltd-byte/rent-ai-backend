import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Job } from '../entities/Job';
import { JobNames, JobObject } from '../utils/job';
import { LeaseService } from './Lease.service';
import {
  LeaseStatus,
  PaymentStatus,
  PaymentType,
  RentStatus,
} from '../utils/lease';

@Service()
export class JobService extends BaseService<Job> {
  constructor(private leaseService: LeaseService) {
    super(dataSource.getRepository(Job));
  }

  async handleJobExecution(job: Job): Promise<void> {
    try {
      switch (job.name) {
        case JobNames.rentDue: {
          await this.executeRentDue(job.data);
          break;
        }
        default: {
          throw new Error('Job not found');
        }
      }
    } catch (error) {
      console.error('Error executing job: ', error);
      throw error;
    }
  }

  private async executeRentDue(
    job: JobObject[JobNames.rentDue]
  ): Promise<void> {
    const lease = await this.leaseService.findById(job.leaseId, {
      relations: {
        payment: true,
        nextLease: true,
      },
    });

    if (lease.leaseStatus !== LeaseStatus.ACTIVE) {
      throw new Error('Lease is currently not active');
    }

    if (lease.nextLease && lease.nextLease.rentStatus === RentStatus.PAID) {
      throw new Error('Lease rent is already paid');
    }

    if (job.type === 'twoMonthsBefore') {
      await this.leaseService.update(lease.id, {
        rentStatus: RentStatus.NEAR_DUE,
      });
    } else if (job.type === 'twoWeeksBefore') {
      await this.leaseService.update(lease.id, {
        rentStatus: RentStatus.DUE,
      });
    } else if (job.type === 'due') {
      await this.leaseService.update(lease.id, {
        rentStatus: RentStatus.OVER_DUE,
      });
    }
  }
}
