import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../utils/response'; // Adjust the import path as necessary
import { AppErrorLogService } from '../services/AppErrorLog.service';
import { FindOptionsWhere, ILike } from 'typeorm';
import { AppErrorLog } from '../entities/AppErrorLog';
import { AppErrorLogValidationTypes } from '../validations/AppErrorLog.validation';

export class AppErrorLogController {
  private appErrorLogService;

  constructor() {
    this.appErrorLogService = new AppErrorLogService();
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, search }: Record<string, any> = req.query;

      const defaultFilter: FindOptionsWhere<AppErrorLog> = {};
      const searchFilters: FindOptionsWhere<AppErrorLog>[] = [];

      if (search) {
        const searchItem = ILike(`%${search}%`);
        searchFilters.push(
          { message: searchItem },
          { func: searchItem },
          { file: searchItem }
        );
      }

      if (type) {
        defaultFilter.type = type;
      }

      const where = searchFilters.length
        ? searchFilters.map((filter) => ({ ...filter, ...defaultFilter }))
        : defaultFilter;

      const appLogs = await this.appErrorLogService.findAllPaginated(
        req.query,
        { where }
      );

      return successResponse(res, 'Returning logs', appLogs);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body: AppErrorLogValidationTypes['create'] = req.body;

      // Track the error with GlitchTip before saving to database
      if (body.message && body.type) {
        const errorObj = new Error(body.message);

        const metadata: Record<string, any> = {
          type: body.type,
          func: body.func || '',
          file: body.file || '',
          // Add any additional contextual data
          data: body.data || {},
          userId: (req as any).user?.id || 'anonymous',
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString(),
        };
      }

      const errorLog = await this.appErrorLogService.create(body);

      return successResponse(res, 'Create Success', errorLog);
    } catch (error) {
      return next(error);
    }
  }
}
