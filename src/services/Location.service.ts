import { dataSource } from '../configs/dtSource';
import { BaseService } from './BaseService';
import { Location } from '../entities/Location';
import { Service } from 'typedi';
import { BadRequestError } from '../configs/error';
import { LocationValidationTypes } from '../validations/Location.validation';
import { PaginationRequest } from '../types/CustomTypes';
import { Property } from '../entities/Property';
import { getPagnation } from '../utils/pagination';

@Service()
export class LocationService extends BaseService<Location> {
  constructor() {
    super(dataSource.getRepository(Location));
  }

  async createLocation(
    data: LocationValidationTypes['create']
  ): Promise<Location> {
    // Check for duplicate name (case sensitive)
    const existingLocation = await this.repository.findOne({
      where: { name: data.name },
    });

    if (existingLocation) {
      throw new BadRequestError('Location with this name already exists');
    }

    const location = this.repository.create(data);
    return await this.repository.save(location);
  }

  async updateLocation(
    id: string,
    data: LocationValidationTypes['update']
  ): Promise<Location> {
    const location = await this.findById(id);

    if (data.name) {
      // Check for duplicate name (case sensitive) excluding current location
      const existingLocation = await this.repository.findOne({
        where: {
          name: data.name,
        },
      });

      if (existingLocation && existingLocation.id !== id) {
        throw new BadRequestError('Location with this name already exists');
      }
    }

    Object.assign(location, data);
    return await this.repository.save(location);
  }

  async getAllLocations(query: PaginationRequest, adminId?: string) {
    const { page, size, sort, sortOrder, search } = query;
    const { limit, offset } = getPagnation(page, size);

    const order: 'ASC' | 'DESC' = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // base count query to compute total items after filters
    const countQb = this.getQueryBuilder('location');

    if (search) {
      const s = `%${String(search).toLowerCase()}%`;
      countQb.andWhere('LOWER(location.name) LIKE :s', { s });
    }

    const totalItems = await countQb.getCount();

    // main query with computed columns
    const qb = this.getQueryBuilder('location')
      .select('location.id', 'id')
      .addSelect('location.name', 'name')
      .addSelect('location.createdAt', 'createdAt')
      .addSelect('location.updatedAt', 'updatedAt');

    // subquery for properties count with optional adminId filtering
    const propertiesSub = qb
      .subQuery()
      .select('COUNT(property.id)')
      .from(Property, 'property')
      .where('property.locationId = location.id')
      .andWhere('property.deletedAt IS NULL');

    // Add adminId filter to the subquery if provided
    if (adminId) {
      propertiesSub.andWhere('property.createdById = :adminId', { adminId });
    }

    qb.addSelect(propertiesSub.getQuery(), 'propertiesCount');

    // Add adminId parameter if provided
    if (adminId) {
      qb.setParameter('adminId', adminId);
    }

    if (search) {
      const s = `%${String(search).toLowerCase()}%`;
      qb.andWhere('LOWER(location.name) LIKE :s', { s });
    }

    // sorting
    const sortMap: Record<string, string> = {
      propertiesCount: 'propertiesCount',
      name: 'location.name',
      createdAt: 'location.createdAt',
      updatedAt: 'location.updatedAt',
    };

    const sortKey =
      sortMap[sort as keyof typeof sortMap] || 'location.createdAt';

    // For computed columns (propertiesCount), we need to use the full subquery
    if (sort === 'propertiesCount') {
      qb.orderBy(propertiesSub.getQuery(), order);
    } else {
      qb.orderBy(sortKey, order);
    }

    // pagination
    qb.skip(offset).take(limit);

    const rows = await qb.getRawMany();

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page ? +page : 0;

    // coerce numeric fields
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      propertiesCount: Number(r.propertiesCount) || 0,
    }));

    return {
      data,
      totalItems,
      currentPage,
      totalPages,
      pageSize: limit,
    };
  }
}
