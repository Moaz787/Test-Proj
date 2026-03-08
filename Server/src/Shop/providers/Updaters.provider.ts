import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImage } from '../Entities/ProducImages.entity';
import { Repository } from 'typeorm';
import { Product } from '../Entities/Product.entity';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class UpdatersProvider {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    private readonly commonService: CommonService,
  ) {}

  async updateProduct(id: string, productDto: any, userId: string, files: Express.Multer.File[]) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['images', 'user'],
      });

      if (!product) throw new NotFoundException('Product not found');

      if (product.user.id !== userId) {
        throw new UnauthorizedException('You are not authorized to update this product');
      }
      const remainingIds = productDto.remainingImageIds
        ? typeof productDto.remainingImageIds === 'string'
          ? productDto.remainingImageIds.split(',').map(id => Number(id.trim()))
          : productDto.remainingImageIds.map(Number)
        : [];

      const imagesToDelete = product.images.filter(img => !remainingIds.includes(img.id));

      for (const img of imagesToDelete) {
        const fileName = img.path.split('/').pop();
        const destination = `products/${userId}/${id}`;
        await this.commonService.deleteImage(fileName, destination);
        await this.imageRepository.delete(img.id);
      }
      let newImagesObjects = [];
      if (files && files.length > 0) {
        const destination = `products/${userId}/${id}`;
        const uploadedPaths = await Promise.all(
          files.map(file => this.commonService.processImage(destination, file, productDto.name || product.name)),
        );
        newImagesObjects = uploadedPaths.map(path => ({ path }) as any);
      }

      const keptImages = product.images.filter(img => remainingIds.includes(img.id));
      const finalImages = [...keptImages, ...newImagesObjects];

      const price = productDto.price ? Number(productDto.price) : product.price;
      const discount = productDto.discount !== undefined ? Number(productDto.discount) : product.discount;
      const finalPrice = price - (price * (discount || 0)) / 100;
      product.images = finalImages;
      this.productRepository.merge(product, {
        ...productDto,
        price,
        discount,
        finalPrice,
        stock: productDto.stock ? Number(productDto.stock) : product.stock,
        categories: productDto.categories ? productDto.categories.split(',') : product.categories,
      });

      return await this.productRepository.save(product);
    } catch (error) {
      console.error('Update Error:', error);
      throw new InternalServerErrorException(error.message || 'Error updating product');
    }
  }
}
