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
import { ConfigService } from '@nestjs/config';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  private stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
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
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody, sig, this.configService.get('STRIPE_WEBHOOK_SECRET'));

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
