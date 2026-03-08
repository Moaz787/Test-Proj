import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Entities/users.entity';
import { Repository } from 'typeorm';
import { Role } from '../../utils/enums';

@Injectable()
export class GettersProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getProfile(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['products'],
      select: {
        products: {
          id: true,
          name: true,
          price: true,
          discount: true,
          finalPrice: true,
          stock: true,
          categories: true,
          brand: true,
          images: true,
          user: false,
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAll() {
    return this.usersRepository.find();
  }

  async getAllAdmins() {
    return this.usersRepository.find({ where: { Role: Role.ADMIN } });
  }

  async getAllUsers() {
    return this.usersRepository.find({ where: { Role: Role.USER } });
  }

  async getAllSellers() {
    return this.usersRepository.find({
      where: { Role: Role.SELLER },
      select: {
        id: true,
        username: true,
        email: true,
        ProfileImage: true,
        password: false,
        IsLoggedIn: false,
        Role: false,
      },
    });
  }
}
