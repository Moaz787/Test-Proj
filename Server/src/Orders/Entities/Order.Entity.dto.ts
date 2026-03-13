import { User } from 'src/clients/Entities/users.entity';
import { Product } from 'src/Shop/Entities/Product.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './OrderItem.Entity';
import { Address } from './Address.Entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Address)
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @Column()
  totalPrice: number;

  @Column()
  status: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => User, user => user.orders)
  user: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];
}
