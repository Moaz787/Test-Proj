import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order } from './Entities/Order.Entity.dto';
import { Product } from 'src/Shop/Entities/Product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './Entities/OrderItem.Entity';
import { CreateOrderDto } from './DTOs/CreateOrder.dto';
import { CreateAddressDto } from './DTOs/CreateAddress.dto';
import { Address } from './Entities/Address.Entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async createAddress(addressData: CreateAddressDto) {
    const address = this.addressRepository.create(addressData);
    return this.addressRepository.save(address);
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of createOrderDto.items) {
      const product = await this.productRepository.findOneBy({ id: item.productId });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      total += product.finalPrice * item.quantity;

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.quantity = item.quantity;
      orderItem.priceAtPurchase = product.finalPrice;
      orderItems.push(orderItem);
    }

    const newOrder = this.orderRepository.create({
      user: { id: userId } as any,
      totalPrice: total,
      items: orderItems,
      status: 'pending',
      address: { id: createOrderDto.addressId } as any,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    return { message: 'Order created successfully', order: savedOrder };
  }
}
