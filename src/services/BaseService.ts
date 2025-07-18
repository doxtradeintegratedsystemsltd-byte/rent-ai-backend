import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { NotFoundError } from '../configs/error';
import { v4 } from 'uuid';
import { getPagnation } from '../utils/pagination';
import { PaginationRequest, TPaginationResponse } from '../types/CustomTypes';

type CustomFindOneOptions<T> = {
  relations?: FindOptionsRelations<T>;
  select?: FindOptionsSelect<T>;
};

export class BaseService<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  getRepository() {
    return this.repository;
  }

  getQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }

  public getEntityName(): string {
    const target = this.repository.target;

    // Check if the target is a constructor (entity class)
    if (target && typeof target === 'function') {
      return target.name; // Now safe to access `name` property
    }

    return 'Entity'; // Fallback if `target` is not a constructor
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create({ id: v4(), ...data });
    return await this.repository.save(entity);
  }

  async findById(id: string, options?: CustomFindOneOptions<T>) {
    const data = await this.repository.findOne({
      where: {
        id: id as any,
      },
      ...options,
    });

    if (!data) {
      const name = this.getEntityName();
      throw new NotFoundError(name + ' Not found');
    }

    return data;
  }

  async findOne(options: FindOneOptions<T>) {
    return this.repository.findOne(options);
  }

  async findOneBy(options: FindOptionsWhere<T>) {
    return this.repository.findOneBy(options);
  }

  async update(id: string, data: QueryDeepPartialEntity<T>) {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async softDelete(id: string) {
    const entity = await this.findById(id);
    return this.repository.softRemove(entity);
  }

  async restore(id: string) {
    await this.repository.restore(id);
    return this.findById(id);
  }

  async findMany(options?: FindManyOptions<T>) {
    const data = await this.repository.find({
      ...options,
    });

    return data;
  }

  async findAllPaginated(
    pagination: PaginationRequest,
    options?: FindManyOptions<T>
  ): Promise<TPaginationResponse<T>> {
    const { page, size, sort, sortOrder, search } = pagination;
    let { limit, offset } = getPagnation(page, size);

    if (limit === -1) {
      limit = Number.MAX_SAFE_INTEGER;
    }

    let order: any;
    if (sort) {
      order = {
        [sort]: sortOrder || 'DESC',
      };
    } else {
      order = undefined;
    }

    const columnNames = this.repository.metadata.columns
      .filter((column) => column.type === 'text')
      .map((column) => column.propertyName);

    // Generate search filters
    const searchFilters: FindOptionsWhere<T>[] = [];
    if (search) {
      const searchItem = ILike(`%${search}%`);
      columnNames.forEach((column) => {
        if (column === 'id') return;
        if (column === 'created_at') return;
        if (column === 'updated_at') return;
        if (column === 'createdAt') return;
        if (column === 'updatedAt') return;

        searchFilters.push({
          [column]: searchItem,
        } as FindOptionsWhere<T>);
      });
    }

    const [results, totalItems] = await this.repository.findAndCount({
      order,
      where: searchFilters.length ? searchFilters : undefined,
      ...options,
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page ? +page : 0;

    return {
      totalItems,
      data: results,
      currentPage,
      totalPages,
      pageSize: limit,
    };
  }
}
