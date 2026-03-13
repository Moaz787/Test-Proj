import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './shop.service';
import { GetProductsFilterDto } from './DTOs/GetProductsFilter.dto';
import { CreateProductDto } from './DTOs/CreateProduct.dto';
import { AuthRoleGuard } from '../Guards/auth-role.guard';
import { UserRole } from '../decorators/auth-role.decorator';
import { Role } from '../utils/enums';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../clients/Entities/users.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../Guards/auth.guard';
import { UpdateProductDto } from './DTOs/UpdateProduct.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get('search')
  SearchProducts(@Query() filterDto: GetProductsFilterDto) {
    return this.productService.SearchProducts(filterDto);
  }

  @Post()
  @UseGuards(AuthGuard, AuthRoleGuard)
  @UserRole(Role.SELLER)
  @UseInterceptors(FilesInterceptor('images', 10))
  createProduct(
    @Body() product: CreateProductDto,
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      return this.productService.createProduct(product, user.id, files);
    } catch (error) {
      throw new InternalServerErrorException('Error creating product');
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard, AuthRoleGuard)
  @UserRole(Role.SELLER)
  @UseInterceptors(FilesInterceptor('images', 10))
  updateProduct(
    @Param('id') id: string,
    @Body() productDto: UpdateProductDto,
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      return this.productService.updateProduct(id, productDto, user.id, files);
    } catch (error) {
      throw new InternalServerErrorException('Error updating product');
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AuthRoleGuard)
  @UserRole(Role.SELLER)
  deleteProduct(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      return this.productService.deleteProduct(id, user.id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting product');
    }
  }
}
