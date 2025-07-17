import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Property } from '../entities/Property';
import { PropertyValidationTypes } from '../validations/Property.validation';
import { User } from '../entities/User';

@Service()
export class PropertyService extends BaseService<Property> {
  constructor() {
    super(dataSource.getRepository(Property));
  }

  createProperty(body: PropertyValidationTypes['create'], authUser: User) {
    const property = this.create({
      ...body,
      createdById: authUser.id,
    });

    return property;
  }
}
