import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { PropertyService } from '../services/Property.service';
import { Property } from '../entities/Property';
import { PropertyValidationTypes } from '../validations/Property.validation';

@Service()
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const properties = await this.propertyService.getAllProperties(
        req.query,
        authUser
      );

      return successResponse(res, 'Returning properties', properties);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;

      const body = req.body as PropertyValidationTypes['create'];
      const property = await this.propertyService.createProperty(
        body,
        authUser
      );

      return successResponse(res, 'Create Success', property);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const property = await this.propertyService.findById(id, {
        relations: {
          createdBy: true,
          currentLease: {
            tenant: true,
            previousLease: true,
            payment: true,
            nextLease: {
              payment: true,
            },
          },
        },
      });

      const payments = await this.propertyService.getPropertyPayments(
        id,
        property.currentLease?.tenantId
      );

      return successResponse(res, 'Property found', {
        ...property,
        payments,
      });
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body as PropertyValidationTypes['update'];

      const property = await this.propertyService.updateProperty(id, body);

      return successResponse(res, 'Property updated successfully', property);
    } catch (error) {
      return next(error);
    }
  }

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const property = await this.propertyService.softDeleteProperty(id);

      return successResponse(res, 'Property deleted successfully', property);
    } catch (error) {
      return next(error);
    }
  }
}
