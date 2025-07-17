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
      const properties = await this.propertyService.findAllPaginated(req.query);
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
        },
      });

      return successResponse(res, 'Property found', property);
    } catch (error) {
      return next(error);
    }
  }
}
