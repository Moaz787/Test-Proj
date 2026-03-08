import { Injectable } from '@nestjs/common';
import { Product } from './Entities/Product.entity';
import { GetProductsFilterDto } from './DTOs/GetProductsFilter.dto';
import { CreateProductDto } from './DTOs/CreateProduct.dto';
import { GettersProvider } from './providers/Getters.provider';
import { CreatorsProvider } from './providers/Creators.provider';
import { UpdatersProvider } from './providers/Updaters.provider';
import { DeleterProvider } from './providers/Deleter.provider';

@Injectable()
export class ProductService {
  constructor(
    private readonly gettersProvider: GettersProvider,
    private readonly creatorsProvider: CreatorsProvider,
    private readonly updatersProvider: UpdatersProvider,
    private readonly deleterProvider: DeleterProvider,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.gettersProvider.getAllProducts();
  }

  async SearchProducts(filterDto: GetProductsFilterDto): Promise<Product[]> {
    return await this.gettersProvider.SearchProducts(filterDto);
  }

  async getProductById(id: string): Promise<Product> {
    return await this.gettersProvider.getProductById(id);
  }

  async createProduct(productDto: CreateProductDto, userId: string, files: Express.Multer.File[]) {
    return await this.creatorsProvider.createProduct(productDto, userId, files);
  }

  async updateProduct(id: string, productDto: any, userId: string, files: Express.Multer.File[]) {
    return await this.updatersProvider.updateProduct(id, productDto, userId, files);
  }

  async deleteProduct(id: string, userId: string) {
    return await this.deleterProvider.deleteProduct(id, userId);
  }
}
