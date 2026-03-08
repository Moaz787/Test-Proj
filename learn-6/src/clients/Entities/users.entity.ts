import { Exclude } from 'class-transformer';
import { Role } from '../../utils/enums';

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from 'src/Shop/Entities/Product.entity';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  brandName: string;

  @Column({ nullable: true })
  brandDescription: string;

  @Column({ nullable: true })
  brandLogo: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  ProfileImage: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  Role: Role;

  @Column({ default: false })
  IsEmailVerified: boolean;

  @Column({ nullable: true })
  @Exclude()
  EmailVerificationToken: string;

  @Column({ nullable: true })
  @Exclude()
  EmailVerificationTokenExpiry: Date;

  @Column({ default: false })
  IsLoggedIn: boolean;

  @Column({ nullable: true, default: null })
  @Exclude()
  PasswordResetCode: number;

  @Column({ nullable: true, default: null })
  @Exclude()
  PasswordResetCodeExpiry: Date;

  @OneToMany(() => Product, product => product.user)
  products: Product[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  CreatedAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  UpdatedAt: Date;
}
