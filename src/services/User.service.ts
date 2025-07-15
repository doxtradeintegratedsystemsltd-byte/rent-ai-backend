import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { dataSource } from '../configs/dtSource';
import { User } from '../entities/User';

@Service()
export class UserService extends BaseService<User> {
  constructor() {
    super(dataSource.getRepository(User));
  }
}
