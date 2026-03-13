import { forwardRef, Module } from '@nestjs/common';
import { ProductController } from './shop.controller';
import { ProductService } from './shop.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './Entities/Product.entity';
import { ProductImage } from './Entities/ProducImages.entity';
import { GettersProvider } from './providers/Getters.provider';
import { CreatorsProvider } from './providers/Creators.provider';
import { UpdatersProvider } from './providers/Updaters.provider';
import { DeleterProvider } from './providers/Deleter.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage])],
  controllers: [ProductController],
  providers: [ProductService, GettersProvider, CreatorsProvider, UpdatersProvider, DeleterProvider],
  exports: [forwardRef(() => ProductService), TypeOrmModule],
})
export class ProductModule {}
