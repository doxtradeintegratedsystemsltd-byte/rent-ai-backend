import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { JobService } from '../services/Job.service';

@Service()
export class JobController {
  constructor(private jobService: JobService) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await this.jobService.findAllPaginated(req.query);
      return successResponse(res, 'Returning jobs', jobs);
    } catch (error) {
      return next(error);
    }
  }
}
