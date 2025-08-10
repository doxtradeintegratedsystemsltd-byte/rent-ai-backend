import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { LeaseService } from '../services/Lease.service';
import { Lease } from '../entities/Lease';
import { LeaseValidationTypes } from '../validations/Lease.validation';
import { BadRequestError } from '../configs/error';
import envConfig from '../configs/envConfig';

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

  async getAuthTenantLease(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const data = await this.leaseService.getTenantLease(authUser.tenantId);
      return successResponse(res, 'Returning tenant lease', data);
    } catch (error) {
      return next(error);
    }
  }

  async checkLeasePaymentReference(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { reference } =
        req.query as LeaseValidationTypes['getLeasePaymentReference'];

      const data = await this.leaseService.checkLeasePaymentReference(
        reference
      );
      return successResponse(res, 'Returning lease payment', data);
    } catch (error) {
      return next(error);
    }
  }

  async getOneLease(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await this.leaseService.findById(id, {
        relations: {
          property: true,
          payment: true,
          tenant: true,
          createdBy: true,
        },
      });
      return successResponse(res, 'Returning lease', data);
    } catch (error) {
      return next(error);
    }
  }

  async leasePaymentCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { reference } =
        req.query as LeaseValidationTypes['getLeasePaymentReference'];

      await this.leaseService.processLeasePayment(reference);

      return res.redirect(
        `${envConfig.FRONTEND_URL}/tenant?reference=${reference}`
      );
    } catch (error) {
      return next(error);
    }
  }
}
