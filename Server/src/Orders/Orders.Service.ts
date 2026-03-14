import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order } from './Entities/Order.Entity.dto';
import { Product } from 'src/Shop/Entities/Product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './Entities/OrderItem.Entity';
import { CreateOrderDto } from './DTOs/CreateOrder.dto';
import { CreateAddressDto } from './DTOs/CreateAddress.dto';
import { Address } from './Entities/Address.Entity';
import { OrdersGateway } from './Orders.gateway';
import Stripe from 'stripe';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  private stripe = new Stripe(
    'sk_test_51TAfFx3sfSvpeoCg8rhe4ltKRHc3GYcHNeJQfrqzfibBhlyo92A4MCZM8JKQvRki3LzOYfiC63OXBEivWibOw9u900IrJgdY5A',
    {
      apiVersion: '2025-11-17.clover' as any,
    },
  );

  async getAllOrders() {
    return this.orderRepository.find({
      relations: ['items', 'items.product', 'user', 'address'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createAddress(addressData: CreateAddressDto) {
    const address = this.addressRepository.create(addressData);
    return this.addressRepository.save(address);
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of createOrderDto.items) {
      if (item.quantity <= 0) throw new BadRequestException(`Quantity must be greater than 0`);
      const product = await this.productRepository.findOneBy({ id: item.productId });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      if (product.stock < item.quantity) throw new BadRequestException(`Product ${item.productId} is out of stock`);

      total += product.finalPrice * item.quantity;

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.quantity = item.quantity;
      orderItem.priceAtPurchase = product.finalPrice;
      orderItems.push(orderItem);

      product.stock -= item.quantity;
      await this.productRepository.save(product);
    }

    const newOrder = this.orderRepository.create({
      user: { id: userId } as any,
      totalPrice: total,
      PaymentStatus: 'unpaid',
      items: orderItems,
      status: 'pending',
      address: { id: createOrderDto.addressId } as any,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    this.ordersGateway.SendNewOrderNotification(savedOrder);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Order from My Store' },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: savedOrder.id.toString(),
      },
      mode: 'payment',
      success_url: 'http://localhost:3000/api/v1/success',
      cancel_url: 'http://localhost:3000/api/v1/cancel',
    });

    return { message: 'Order created successfully', order: savedOrder, url: session.url };
  }

  async markAsPaid(orderId: string) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    order.PaymentStatus = 'paid';
    order.status = 'completed';
    return this.orderRepository.save(order);
  }
}
