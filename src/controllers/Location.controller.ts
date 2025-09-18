import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { successResponse } from '../utils/response';
import { LocationService } from '../services/Location.service';
import { LocationValidationTypes } from '../validations/Location.validation';
import { UserType } from '../utils/authUser';

@Service()
export class LocationController {
  constructor(private locationService: LocationService) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;

      let adminId;
      if (authUser.userType === UserType.SUPER_ADMIN) {
        adminId = req.query.adminId as string | undefined;
      } else {
        adminId = authUser.id;
      }

      const locations = await this.locationService.getAllLocations(
        req.query,
        adminId
      );

      return successResponse(res, 'Returning locations', locations);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as LocationValidationTypes['create'];
      const location = await this.locationService.createLocation(body);

      return successResponse(res, 'Location created successfully', location);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const location = await this.locationService.findById(id);

      return successResponse(res, 'Location found', location);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body as LocationValidationTypes['update'];

      const location = await this.locationService.updateLocation(id, body);

      return successResponse(res, 'Location updated successfully', location);
    } catch (error) {
      return next(error);
    }
  }

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const location = await this.locationService.softDelete(id);

      return successResponse(res, 'Location deleted successfully', location);
    } catch (error) {
      return next(error);
    }
  }
}
