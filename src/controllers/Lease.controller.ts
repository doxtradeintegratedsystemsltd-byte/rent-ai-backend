import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { LeaseService } from '../services/Lease.service';
import { Lease } from '../entities/Lease';
import { LeaseValidationTypes } from '../validations/Lease.validation';

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

  async createLeasePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as LeaseValidationTypes['createLeasePayment'];
      const authUser = req.user!;

      const data = await this.leaseService.createLeasePayment(body, authUser);

      return successResponse(res, 'Create Success', data);
    } catch (error) {
      return next(error);
    }
  }
}
