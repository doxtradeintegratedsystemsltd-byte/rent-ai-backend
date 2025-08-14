import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { TenantService } from '../services/Tenant.service';
import { Tenant } from '../entities/Tenant';
import { TenantValidationTypes } from '../validations/Tenant.validation';

@Service()
export class TenantController {
  constructor(private tenantService: TenantService) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.findAllPaginated(req.query, {
        relations: {
          currentLease: {
            property: true,
          },
        },
      });
      return successResponse(res, 'Returning tenants', tenants);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const body = req.body as TenantValidationTypes['create'];
      const data = await this.tenantService.addTenant(body, authUser);

      return successResponse(res, 'Create Success', data);
    } catch (error) {
      return next(error);
    }
  }

  async updateAuthTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const body = req.body as TenantValidationTypes['update'];

      const data = await this.tenantService.updateTenant(authUser.tenant, body);
      return successResponse(res, 'Update Success', data);
    } catch (error) {
      return next(error);
    }
  }

  async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body as TenantValidationTypes['update'];
      const tenant = await this.tenantService.findById(id);

      const data = await this.tenantService.updateTenant(tenant, body);
      return successResponse(res, 'Update Success', data);
    } catch (error) {
      return next(error);
    }
  }
}
