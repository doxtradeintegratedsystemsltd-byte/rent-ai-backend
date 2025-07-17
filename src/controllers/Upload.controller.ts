import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../configs/error';
import { Service } from 'typedi';

@Service()
export class UploadController {
  async uploadOneFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('Please provide valid file for upload');
      }

      return successResponse(res, 'File uploaded', req.file.path);
    } catch (error) {
      return next(error);
    }
  }

  async uploadMultiFiles(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files?.length) {
        throw new BadRequestError('Please provide valid files for upload');
      }
      const urls = (req.files as Express.Multer.File[]).map(
        (file) => file.path
      );

      return successResponse(res, 'Files uploaded', urls);
    } catch (error) {
      return next(error);
    }
  }
}
