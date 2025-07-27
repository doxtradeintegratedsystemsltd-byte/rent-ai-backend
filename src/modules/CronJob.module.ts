import cron from 'node-cron';
import { Job } from '../entities/Job';
import envConfig from '../configs/envConfig';
import { JobNames, JobStatus, timestampToCron } from '../utils/job';
import { JobService } from '../services/Job.service';
import { Service } from 'typedi';
import { ScheduleType } from '../interfaces/Job';

@Service()
export class CronJobModule {
  private jobsScheduled: Set<string> = new Set();

  constructor(private jobService: JobService) {}

  public async scheduleJob(
    name: JobNames,
    schedule: ScheduleType,
    data: object,
    isRecurring: boolean = false
  ) {
    let cronExpression: string;

    // Determine the type of schedule
    if ('cron' in schedule) {
      if (!cron.validate(schedule.cron)) {
        throw new Error(`Invalid cron schedule: ${schedule.cron}`);
      }
      cronExpression = schedule.cron;
    } else if ('timestamp' in schedule) {
      if (schedule.timestamp.getTime() <= Date.now()) {
        throw new Error('Provided timestamp is in the past.');
      }
      cronExpression = timestampToCron(schedule.timestamp);
    } else {
      throw new Error('Invalid schedule type.');
    }

    console.log(`Scheduling job "${name}" with cron: ${cronExpression}`);

    // Save the job to the database
    const job = await this.jobService.create({
      name: name,
      schedule: cronExpression,
      isRecurring,
      data,
      jobStatus: JobStatus.pending,
    });

    // Register the job
    if (envConfig.RUN_JOBS) {
      this.registerCronJob(job);
    }
    return job;
  }

  private async executeJob(_job: Job): Promise<void> {
    const job = await this.jobService.findById(_job.id);

    if (
      job.jobStatus === JobStatus.pending ||
      (job.isRecurring && job.jobStatus === JobStatus.completed)
    ) {
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

  private registerCronJob(job: Job): void {
    try {
      if (this.jobsScheduled.has(job.id)) {
        console.warn(`Job '${job.name}' is already registered.`);
        return;
      }

      if (
        !(
          job.jobStatus === JobStatus.pending ||
          (job.isRecurring && job.jobStatus === JobStatus.completed)
        )
      ) {
        return;
      }

      console.log(
        `Registering${job.isRecurring ? ' recurring' : ''} job '${
          job.name
        }' with schedule: ${job.schedule}`
      );
      this.jobsScheduled.add(job.id);

      const task = cron.schedule(job.schedule, async () => {
        await this.executeJob(job);
        if (!job.isRecurring) {
          console.log(`Stopping one-time job '${job.name}'`);
          task.stop(); // Stop the cron job
          this.jobsScheduled.delete(job.id);
        }
      });
    } catch (error) {
      console.error(`Failed to register job '${job.name}':`, error);
      this.jobsScheduled.delete(job.id);
    }
  }

  public async loadPersistedJobs(): Promise<void> {
    const jobs = await this.jobService.findMany({
      where: [{ jobStatus: JobStatus.pending }, { isRecurring: true }],
    });

    console.log(`Found ${jobs.length} persisted jobs.`);
    for (const job of jobs) {
      this.registerCronJob(job);
    }
  }
}
