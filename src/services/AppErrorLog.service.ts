import { Service } from 'typedi';
import { AppErrorLog } from '../entities/AppErrorLog';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';

@Service()
export class AppErrorLogService extends BaseService<AppErrorLog> {
  constructor() {
    super(dataSource.getRepository(AppErrorLog));
  }
}
