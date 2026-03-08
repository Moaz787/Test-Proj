import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './Entities/Product.entity';
import { Repository } from 'typeorm';
import { GetProductsFilterDto } from './DTOs/GetProductsFilter.dto';
import { CreateProductDto } from './DTOs/CreateProduct.dto';
import { CommonService } from '../common/common.service';
import { User } from 'src/clients/Entities/users.entity';
import { UpdateProductDto } from './DTOs/UpdateProduct.dto';
import { ProductImage } from './Entities/ProducImages.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    private readonly commonService: CommonService,
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
