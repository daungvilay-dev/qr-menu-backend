import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isEmpty, isNil } from 'lodash';
import { EntityManager, In, Like, Repository } from 'typeorm';
import { ErrorEnum } from '~/common/constants/error-code.constant';
import {
  ROOT_ROLE_ID,
  SYS_USER_INITPASSWORD,
} from '~/common/constants/system.constant';
import Redis from 'ioredis';
import { InjectRedis } from '~/common/decorators/inject-redis.decorator';
import { BusinessException } from '~/common/exceptions/biz.exception';
import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';
import { UserStatus } from './constant';
import { PasswordUpdateDto } from './dto/password.dto';
import { AccessTokenEntity } from '~/modules/auth/entities/access-token.entity';
import { UserDto, UserUpdateDto, UserQueryDto } from './dto/user.dto';
import { RegisterDto } from '~/modules/auth/dto/auth.dto';
import { UserEntity } from './user.entity';
import { AccountInfo } from './user.model';
import { md5, randomValue } from '~/utils';
import { RoleEntity } from '../role/role.entity';
import { AccountUpdateDto } from '~/modules/auth/dto/account.dto';
import {
  genAuthPermKey,
  genAuthPVKey,
  genAuthTokenKey,
  genOnlineUserKey,
} from '~/helper/genRedisKey';
@Injectable()
export class UserService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findUserById(id: number): Promise<UserEntity | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.psalt'])
      .where({
        id,
        status: UserStatus.Enabled,
      })
      .getOne();
  }

  async findUserByUserName(username: string): Promise<UserEntity | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.psalt'])
      .where({
        username,
        status: UserStatus.Enabled,
      })
      .getOne();
  }

  /**
   * Get user information
   * @param uid user id
   */
  async getAccountInfo(uid: number): Promise<AccountInfo> {
    const user: UserEntity = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where(`user.id = :uid`, { uid })
      .getOne();

    if (isEmpty(user)) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    delete user?.psalt;
    return user;
  }

  /**
   * Update personal information
   */

  async updateAccountInfo(uid: number, info: AccountUpdateDto): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: uid });
    if (isEmpty(user)) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    const data = {
      ...(info.nickname ? { nickname: info.nickname } : null),
      ...(info.avatar ? { avatar: info.avatar } : null),
      ...(info.email ? { email: info.email } : null),
      ...(info.phone ? { phone: info.phone } : null),
      ...(info.qq ? { qq: info.qq } : null),
      ...(info.remark ? { remark: info.remark } : null),
    };
    await this.userRepository.update(uid, data);
  }

  /**
   * Change password
   */
  async updatePassword(uid: number, dto: PasswordUpdateDto): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.psalt'])
      .where({ id: uid })
      .getOne();
    if (isEmpty(user)) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    const comparePassword = md5(`${dto.oldPassword}${user.psalt}`);
    // Original password does not match, not allowed to change
    if (user.password !== comparePassword)
      throw new BusinessException(ErrorEnum.PASSWORD_MISMATCH);

    const password = md5(`${dto.newPassword}${user.psalt}`);
    await this.userRepository.update({ id: uid }, { password });
  }

  /**
   * Directly change password
   */

  async forceUpdatePassword(uid: number, password: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: uid });

    const newPassword = md5(`${password}${user.psalt}`);
    await this.userRepository.update({ id: uid }, { password: newPassword });
  }

  /**
   * Add system user, if false is returned, it means the user already exists
   */
  async create({
    username,
    password,
    roleIds,
    ...data
  }: UserDto): Promise<void> {
    const exists = await this.userRepository.findOneBy({
      username,
    });

    if (!isEmpty(exists))
      throw new BusinessException(ErrorEnum.SYSTEM_USER_EXISTS);

    await this.entityManager.transaction(async (manager) => {
      const salt = randomValue(32);
      password = md5(`${password ?? '123456'}${salt}`);
      console.log(password);
      const u = manager.create(UserEntity, {
        username,
        psalt: salt,
        password,
        ...data,
        roles: await this.roleRepository.findBy({ id: In(roleIds) }),
      });

      const result = await manager.save(u);
      return result;
    });
  }

  /**
   * Update user information
   */
  async update(
    id: number,
    { password, status, roleIds, ...data }: UserUpdateDto,
  ): Promise<void> {
    return await this.entityManager.transaction(async (manager) => {
      if (password) await this.forceUpdatePassword(id, password);

      await manager.update(UserEntity, id, {
        ...data,
        status,
      });

      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .where('user.id = :id', { id })
        .getOne();
      if (roleIds) {
        await manager
          .createQueryBuilder()
          .relation(UserEntity, 'roles')
          .of(id)
          .addAndRemove(roleIds, user.roles);
      }
    });
  }

  /**
   * Find user information
   * @param id user id
   */
  async info(id: number): Promise<UserEntity> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    delete user.password;
    delete user.psalt;

    return user;
  }
  async delete(userIds: number[]): Promise<void | never> {
    const rootUserId = await this.findRootUserId();
    if (userIds.includes(rootUserId))
      throw new BadRequestException('Cannot delete root user!');

    await this.userRepository.delete(userIds);
  }
  /**
   * Query user list
   */
  async list({
    page,
    limit,
    username,
    nickname,
    remark,
    email,
    status,
  }: UserQueryDto): Promise<Pagination<UserEntity>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where({
        ...(username ? { username: Like(`%${username}%`) } : null),
        ...(nickname ? { nickname: Like(`%${nickname}%`) } : null),
        ...(remark ? { remark: Like(`%${remark}%`) } : null),
        ...(email ? { email: Like(`%${email}%`) } : null),
        ...(!isNil(status) ? { status } : null),
      });
    return paginate<UserEntity>(queryBuilder, {
      page,
      limit,
    });
  }
  /**
   * Find super admin user ID
   */
  async findRootUserId(): Promise<number> {
    const user = await this.userRepository.findOneBy({
      roles: { id: ROOT_ROLE_ID },
    });
    return user.id;
  }

  /**
   * Disable user
   */
  async forbidden(uid: number, accessToken?: string): Promise<void> {
    await this.redis.del(genAuthPVKey(uid));
    await this.redis.del(genAuthTokenKey(uid));
    await this.redis.del(genAuthPermKey(uid));
    if (accessToken) {
      const token = await AccessTokenEntity.findOne({
        where: { value: accessToken },
      });
      this.redis.del(genOnlineUserKey(token.id));
    }
  }

  /**
   * Disable multiple users
   */
  async multiForbidden(uids: number[]): Promise<void> {
    if (uids) {
      const pvs: string[] = [];
      const ts: string[] = [];
      const ps: string[] = [];
      uids.forEach((uid) => {
        pvs.push(genAuthPVKey(uid));
        ts.push(genAuthTokenKey(uid));
        ps.push(genAuthPermKey(uid));
      });
      await this.redis.del(pvs);
      await this.redis.del(ts);
      await this.redis.del(ps);
    }
  }

  /**
   * Check if username exists
   */
  async exist(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (isNil(user)) throw new BusinessException(ErrorEnum.SYSTEM_USER_EXISTS);

    return true;
  }

  /**
   * Register
   */
  async register({ username, ...data }: RegisterDto): Promise<void> {
    const exists = await this.userRepository.findOneBy({
      username,
    });
    if (!isEmpty(exists))
      throw new BusinessException(ErrorEnum.SYSTEM_USER_EXISTS);

    await this.entityManager.transaction(async (manager) => {
      const salt = randomValue(32);

      const password = md5(`${data.password ?? 'a123456'}${salt}`);

      const u = manager.create(UserEntity, {
        username,
        password,
        status: 1,
        psalt: salt,
      });

      const user = await manager.save(u);

      return user;
    });
  }
}
