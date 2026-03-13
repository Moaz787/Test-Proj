import { forwardRef, Module } from '@nestjs/common';
import { OrdersController } from './Orders.Controller';
import { OrdersService } from './Orders.Service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './Entities/Order.Entity.dto';
import { OrderItem } from './Entities/OrderItem.Entity';
import { Address } from './Entities/Address.Entity';
import { ProductModule } from 'src/Shop/shop.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Address]), ProductModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
