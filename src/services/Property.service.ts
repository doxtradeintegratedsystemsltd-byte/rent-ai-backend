import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Property } from '../entities/Property';

@Service()
export class PropertyService extends BaseService<Property> {
  constructor() {
    super(dataSource.getRepository(Property));
  }
}
