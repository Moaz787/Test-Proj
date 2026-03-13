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

  async createOrder(userId: string, productIds: string[], quantities: number[], addressId: string) {
    let total = 0;
    const items: OrderItem[] = [];

    for (let i = 0; i < productIds.length; i++) {
      const product = await this.productRepository.findOneBy({ id: productIds[i] });
      if (!product) throw new NotFoundException(`Product ${productIds[i]} not found`);

      total += product.finalPrice * quantities[i];

      items.push(
        Object.assign(new OrderItem(), {
          product,
          quantity: quantities[i],
          priceAtPurchase: product.finalPrice,
        }),
      );
    }

    const newOrder = this.orderRepository.create({
      user: { id: userId } as any,
      totalPrice: total,
      items: items,
      status: 'pending',
      address: { id: addressId } as any,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    return { message: 'Order created successfully', order: savedOrder };
  }
}
