import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { TenantService } from '../services/Tenant.service';
import { Tenant } from '../entities/Tenant';

@Service()
export class TenantController {
  constructor(private tenantService: TenantService) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.findAllPaginated(req.query);
      return successResponse(res, 'Returning tenants', tenants);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const tenant = await this.tenantService.create(body);
      return successResponse(res, 'Create Success', tenant);
    } catch (error) {
      return next(error);
    }
  }
}
