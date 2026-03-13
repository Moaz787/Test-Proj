import { Module } from '@nestjs/common';
import { OrdersController } from './Orders.Controller';
import { OrdersService } from './Orders.Service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './Entities/Order.Entity.dto';
import { OrderItem } from './Entities/OrderItem.Entity';
import { Address } from './Entities/Address.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Address])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
