import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Lease } from '../entities/Lease';

@Service()
export class LeaseService extends BaseService<Lease> {
  constructor() {
    super(dataSource.getRepository(Lease));
  }
}
