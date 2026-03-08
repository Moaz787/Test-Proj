import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../Entities/Product.entity';
import { Repository } from 'typeorm';
import { GetProductsFilterDto } from '../DTOs/GetProductsFilter.dto';

@Injectable()
export class GettersProvider {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['user', 'images'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
          ProfileImage: true,
          brandLogo: true,
          brandName: true,
          brandDescription: true,
          password: false,
          IsLoggedIn: false,
          Role: false,
        },
      },
    });
  }

  async SearchProducts(filterDto: GetProductsFilterDto): Promise<Product[]> {
    const { search, minPrice, maxPrice, category, brand } = filterDto;
    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (minPrice) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (category && category.length > 0) {
      const categoriesArray = Array.isArray(category) ? category : [category];
      query.andWhere('product.categories && ARRAY[:...categoriesArray]', {
        categoriesArray,
      });
    }

    if (brand) {
      query.andWhere('product.brand = :brand', { brand });
    }

    return await query.getMany();
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['user', 'images'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
          ProfileImage: true,
          brandLogo: true,
          brandName: true,
          brandDescription: true,
          password: false,
          IsLoggedIn: false,
          Role: false,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }
}
