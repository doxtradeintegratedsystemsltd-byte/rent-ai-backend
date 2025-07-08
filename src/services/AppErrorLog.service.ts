import { AppDataSource } from '../configs';
import { AppErrorLog } from '../entities/AppErrorLog';
import { BaseService } from './BaseService';

export class AppErrorLogService extends BaseService<AppErrorLog> {
  constructor() {
    super(AppDataSource.getRepository(AppErrorLog));
  }
}
