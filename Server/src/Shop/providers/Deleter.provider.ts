import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../Entities/Product.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class DeleterProvider {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly commonService: CommonService,
  ) {}

  async deleteProduct(id: string, userId: string) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['user', 'images'],
      });

      if (!product) throw new NotFoundException('Product not found');

      if (product.user.id !== userId) {
        throw new UnauthorizedException('You are not authorized to delete this product');
      }

      for (const img of product.images) {
        const fileName = img.path.split('/').pop();
        const destination = `products/${userId}/${id}`;
        await this.commonService.deleteImage(fileName, destination);
      }

      await this.productRepository.delete(id);

      return { message: 'Product deleted successfully' };
    } catch (error) {
      console.error('Delete Error:', error);
      throw new InternalServerErrorException(error.message || 'Error deleting product');
    }
  }
}
