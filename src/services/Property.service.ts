import { Container, Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { Property } from '../entities/Property';
import { PropertyValidationTypes } from '../validations/Property.validation';
import { User } from '../entities/User';
import { BadRequestError } from '../configs/error';
import { PaginationRequest } from '../types/CustomTypes';
import { FindOptionsWhere, ILike, In, IsNull, Not } from 'typeorm';
import { UserType } from '../utils/authUser';
import { PaymentStatus, RentStatus } from '../utils/lease';
import { deepMerge } from '../utils/searchFilter';
import { LeasePaymentService } from './LeasePayment.service';

@Service()
export class PropertyService extends BaseService<Property> {
  constructor() {
    super(dataSource.getRepository(Property));
  }

  private get leasePaymentService(): LeasePaymentService {
    return Container.get(LeasePaymentService);
  }

  async getAllProperties(query: PaginationRequest, authUser: User) {
    const { search, status, adminId } = query;

    const defaultFilter: FindOptionsWhere<Property> = {};
    const searchFilters: FindOptionsWhere<Property>[] = [];

    if (authUser.userType === UserType.ADMIN) {
      defaultFilter.createdById = authUser.id;
    } else {
      if (adminId) {
        defaultFilter.createdById = adminId;
      }
    }

    if (search) {
      const searchItem = ILike(`%${search}%`);
      searchFilters.push(
        { propertyName: searchItem },
        { propertyAddress: searchItem },
        { propertyArea: searchItem },
        { propertyState: searchItem }
      );
    }

    if (status) {
      switch (status) {
        case 'occupied': {
          defaultFilter.currentLease = Not(IsNull());
          break;
        }
        case 'unoccupied': {
          defaultFilter.currentLease = IsNull();
          break;
        }
        case 'rent-paid': {
          defaultFilter.currentLease = {
            rentStatus: RentStatus.PAID,
          };
          break;
        }
        case 'rent-unpaid': {
          defaultFilter.currentLease = {
            rentStatus: In([RentStatus.DUE, RentStatus.OVER_DUE]),
          };
          break;
        }
      }
    }

    const where = searchFilters.length
      ? searchFilters.map((filter) => deepMerge(defaultFilter, filter))
      : defaultFilter;

    const properties = await this.findAllPaginated(query, {
      where,
      relations: {
        createdBy: true,
        currentLease: {
          tenant: true,
        },
      },
    });
    return properties;
  }

  async getPropertyPayments(id: string, tenantId?: string) {
    await this.findById(id);

    const payments = await this.leasePaymentService.findMany({
      where: {
        lease: {
          propertyId: id,
          tenantId,
        },
        status: PaymentStatus.COMPLETED,
      },
      order: {
        paymentDate: 'DESC',
      },
    });

    return payments;
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
    const property = await this.findById(id, {
      relations: {
        currentLease: true,
      },
    });

    if (property.currentLease) {
      throw new BadRequestError(
        'Property currently has an active lease. Please remove the tenant first.'
      );
    }

    await this.softDelete(id);

    return property;
  }
}
