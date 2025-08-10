import { Job } from '../entities/Job';
import { JobNames, JobStatus } from '../utils/job';
import { JobService } from '../services/Job.service';
import { Service } from 'typedi';
import { ScheduleType } from '../interfaces/Job';
import { LessThanOrEqual } from 'typeorm';

@Service()
export class CronJobModule {
  private jobsScheduled: Set<string> = new Set();
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(private jobService: JobService) {}

  public async scheduleJob(
    name: JobNames,
    schedule: ScheduleType,
    data: object
  ) {
    let scheduledAt: Date;

    // Determine the scheduled time
    if ('cron' in schedule) {
      throw new Error(
        'Cron schedules are not supported. Please use timestamp-based scheduling.'
      );
    } else if ('timestamp' in schedule) {
      // if (schedule.timestamp.getTime() <= Date.now()) {
      //   throw new Error('Provided timestamp is in the past.');
      // }
      scheduledAt = schedule.timestamp;
    } else {
      throw new Error('Invalid schedule type.');
    }

    console.log(`Scheduling job "${name}" for: ${scheduledAt.toISOString()}`);

    // Save the job to the database
    const job = await this.jobService.create({
      name: name,
      schedule: scheduledAt.toISOString(), // Store the timestamp as a string
      data,
      jobStatus: JobStatus.pending,
      scheduledAt: scheduledAt,
    });

    return job;
  }

  private async executeJob(_job: Job): Promise<void> {
    const job = await this.jobService.findById(_job.id);

    if (job.jobStatus === JobStatus.pending) {
      try {
        console.log(`Executing job: '${job.name}'`);
        await this.jobService.update(job.id, { jobStatus: JobStatus.running });

        await this.jobService.handleJobExecution(job);

        console.log(`Job '${job.name}' completed successfully`);
        job.jobStatus = JobStatus.completed;
        job.lastRunAt = new Date();
        job.lastError = undefined;
      } catch (error) {
        console.error(`Job '${job.name}' failed:`, error);
        job.jobStatus = JobStatus.failed;
        job.lastError = error.message;
      } finally {
        await this.jobService.update(job.id, job);
      }
    } else {
      console.warn(`Job '${job.name}' is not in a state to execute.`);
    }
  }

  public startPolling(): void {
    console.log('Starting job polling');
    // Poll every minute for jobs that are due
    this.pollingInterval = setInterval(async () => {
      await this.checkDueJobs();
    }, 60 * 1000); // 1 minute
  }

  private async checkDueJobs(): Promise<void> {
    try {
      const now = new Date();
      const jobs = await this.jobService.findMany({
        where: [
          {
            jobStatus: JobStatus.pending,
            scheduledAt: LessThanOrEqual(now),
          },
        ],
      });

      for (const job of jobs) {
        if (job.scheduledAt && job.scheduledAt <= now) {
          console.log(`Executing job: '${job.name}'`);
          await this.executeJob(job);
        }
      }
    } catch (error) {
      console.error('Error checking due jobs:', error);
    }
  }

  public stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Job polling stopped');
    }
  }
}
