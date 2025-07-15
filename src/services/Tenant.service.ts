import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Tenant } from '../entities/Tenant';

@Service()
export class TenantService extends BaseService<Tenant> {
  constructor() {
    super(dataSource.getRepository(Tenant));
  }
}
