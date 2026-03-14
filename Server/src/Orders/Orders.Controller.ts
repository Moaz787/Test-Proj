import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './Orders.Service';
import { CreateAddressDto } from './DTOs/CreateAddress.dto';
import { CreateOrderDto } from './DTOs/CreateOrder.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/clients/Entities/users.entity';
import { AuthGuard } from 'src/Guards/auth.guard';
import { AuthRoleGuard } from 'src/Guards/auth-role.guard';
import { Role } from 'src/utils/enums';
import { UserRole } from 'src/decorators/auth-role.decorator';
import { Get } from '@nestjs/common';
import Stripe from 'stripe';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  private stripe = new Stripe(
    'sk_test_51TAfFx3sfSvpeoCg8rhe4ltKRHc3GYcHNeJQfrqzfibBhlyo92A4MCZM8JKQvRki3LzOYfiC63OXBEivWibOw9u900IrJgdY5A',
    {
      apiVersion: '2025-11-17.clover' as any,
    },
  );

  @Get('all')
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

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

  @Post('webhook')
  async handleStripeWebhook(@Headers('stripe-signature') sig: string, @Req() req: any) {
    const endpointSecret = 'whsec_5761b7151482e6a76c11e0d1838eea0bb1e4cf7afde4e9c9b28c55388c817e38';

    let event;

    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        await this.orderService.markAsPaid(session.metadata.orderId);
      }

      console.log('✅ Webhook Verified!');
      return { received: true };
    } catch (err) {
      console.log('❌ Error:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
