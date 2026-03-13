import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './Orders.Service';
import { CreateAddressDto } from './DTOs/CreateAddress.dto';
import { CreateOrderDto } from './DTOs/CreateOrder.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/clients/Entities/users.entity';
import { AuthGuard } from 'src/Guards/auth.guard';
import { AuthRoleGuard } from 'src/Guards/auth-role.guard';
import { Role } from 'src/utils/enums';
import { UserRole } from 'src/decorators/auth-role.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post('address')
  async CreateAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.orderService.createAddress(createAddressDto);
  }

  @Post('order')
  @UseGuards(AuthGuard, AuthRoleGuard)
  @UserRole(Role.USER)
  async CreateOrder(@CurrentUser() user: User, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(user.id, createOrderDto);
  }
}
