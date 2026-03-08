import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../Entities/Product.entity';
import { Repository } from 'typeorm';
import { ProductImage } from '../Entities/ProducImages.entity';
import { CommonService } from 'src/common/common.service';
import { CreateProductDto } from '../DTOs/CreateProduct.dto';

@Injectable()
export class CreatorsProvider {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly commonService: CommonService,
  ) {}

  async createProduct(productDto: CreateProductDto, userId: string, files: Express.Multer.File[]) {
    try {
      const price = Number(productDto.price);
      const discount = Number(productDto.discount || 0);
      const finalPrice = price - (price * discount) / 100;

      const newProduct = this.productRepository.create({
        ...productDto,
        stock: Number(productDto.stock),
        price,
        discount,
        finalPrice,
        categories: productDto.categories ? productDto.categories.split(',') : [],
        user: { id: userId },
        images: [],
      });

      const savedProduct = await this.productRepository.save(newProduct);
      if (files && files.length > 0) {
        const destination = `products/${userId}/${savedProduct.id}`;
        const uploadedPaths = await Promise.all(
          files.map(file => this.commonService.processImage(destination, file, savedProduct.name)),
        );

        savedProduct.images = uploadedPaths.map(path => ({ path }) as ProductImage);
        return await this.productRepository.save(savedProduct);
      }

      return savedProduct;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error creating product');
    }
  }
}
