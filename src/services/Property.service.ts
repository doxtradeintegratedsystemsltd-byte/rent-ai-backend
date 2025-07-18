import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Property } from '../entities/Property';
import { PropertyValidationTypes } from '../validations/Property.validation';
import { User } from '../entities/User';
import { BadRequestError } from '../configs/error';

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

  async updateProperty(id: string, body: PropertyValidationTypes['update']) {
    await this.findById(id);

    const updatedProperty = await this.update(id, body);

    return updatedProperty;
  }

  async softDeleteProperty(id: string) {
    const property = await this.findById(id);

    if (property.deletedAt) {
      throw new BadRequestError('Property already deleted');
    }

    await this.softDelete(id);

    return property;
  }
}
