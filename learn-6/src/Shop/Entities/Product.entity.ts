import { Transform } from 'class-transformer';
import { CURRENT_TIMESTAMP } from '../../utils/Constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/clients/Entities/users.entity';
import { ProductImage } from './ProducImages.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float' })
  discount: number;

  @Column({ type: 'float' })
  finalPrice: number;

  @Column()
  description: string;

  @OneToMany(() => ProductImage, image => image.product, { cascade: true })
  images: ProductImage[];

  @Column()
  stock: number;

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  categories: string[];

  @Column()
  brand: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @ManyToOne(() => User, user => user.products)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
