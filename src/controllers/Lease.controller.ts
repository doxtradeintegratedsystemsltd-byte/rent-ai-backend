import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { LeaseService } from '../services/Lease.service';
import { Lease } from '../entities/Lease';

@Service()
export class LeaseController {
  constructor(private leaseService: LeaseService) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const leases = await this.leaseService.findAllPaginated(req.query);
      return successResponse(res, 'Returning leases', leases);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const lease = await this.leaseService.create(body);
      return successResponse(res, 'Create Success', lease);
    } catch (error) {
      return next(error);
    }
  }
}
