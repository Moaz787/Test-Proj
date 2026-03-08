import { Module } from '@nestjs/common';
import { ProductController } from './shop.controller';
import { ProductService } from './shop.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './Entities/Product.entity';
import { ProductImage } from './Entities/ProducImages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
