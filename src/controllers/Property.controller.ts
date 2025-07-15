import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { PropertyService } from '../services/Property.service';
import { Property } from '../entities/Property';

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
      const body = req.body;
      const property = await this.propertyService.create(body);
      return successResponse(res, 'Create Success', property);
    } catch (error) {
      return next(error);
    }
  }
}
