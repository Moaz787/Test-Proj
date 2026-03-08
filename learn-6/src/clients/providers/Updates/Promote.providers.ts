import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../Entities/users.entity';
import { CommonService } from '../../../common/common.service';
import { Role } from '../../../utils/enums';
import { UpdateSellerDto } from 'src/clients/DTOs/UpdateSeller.dto';

@Injectable()
export class PromoteProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly commonService: CommonService,
  ) {}

  async promoteUser(id: string, updaterId: string, role: string, data: UpdateSellerDto, file: Express.Multer.File) {
    let user = await this.usersRepository.findOne({ where: { id } });
    const updater = await this.usersRepository.findOne({
      where: { id: updaterId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.commonService.CheckIfUserLoggedInAndVerified(user, updater);

    if (user.Role === Role.ADMIN || user.Role === Role.SUPER_ADMIN) {
      throw new UnauthorizedException('User is not authorized to promote');
    }

    if (user.Role === Role.USER) {
      if (role === Role.ADMIN) {
        if (id === updaterId) {
          throw new UnauthorizedException('User is not authorized to promote');
        }
        if (updater.Role === Role.SUPER_ADMIN || updater.Role === Role.ADMIN) {
          user.Role = role as Role;
          await this.usersRepository.save(user);

          await this.commonService.SendEmailToUser(
            user.email,
            `User Promoted to ${role}`,
            `You have been promoted to ${role} <br> you can now manage the website <br> <a href="http://localhost:3000">Login</a>`,
          );

          return {
            message: `User promoted to ${role} successfully`,
            accessToken: await this.commonService.generateToken({
              id: user.id,
              IsLoggedIn: user.IsLoggedIn,
              Role: user.Role,
            }),
          };
        } else {
          throw new UnauthorizedException('User is not authorized to promote');
        }
      } else if (role === Role.SELLER) {
        if (updater.Role === Role.SUPER_ADMIN || updater.Role === Role.ADMIN || id === updaterId) {
          user.Role = role as Role;
          user.brandName = data.brandName;
          user.brandDescription = data.brandDescription;

          let filePath;
          if (file) {
            filePath = await this.commonService.processImage('brands', file, user.id);
          }

          await this.usersRepository.save({
            ...user,
            brandLogo: filePath,
          });
          await this.commonService.SendEmailToUser(
            user.email,
            `User Promoted to ${role}`,
            `You have been promoted to ${role} <br> you can now 'sell products' <br> <a href="http://localhost:3000">Login</a>`,
          );

          return {
            message: `User promoted to ${role} successfully`,
            accessToken: await this.commonService.generateToken({
              id: user.id,
              IsLoggedIn: user.IsLoggedIn,
              Role: user.Role,
            }),
          };
        } else {
          throw new UnauthorizedException('User is not authorized to promote');
        }
      }
    } else {
      throw new UnauthorizedException('User is not authorized to promote');
    }

    return {
      message: `User promoted to ${role} successfully`,
      accessToken: await this.commonService.generateToken({
        id: user.id,
        IsLoggedIn: user.IsLoggedIn,
        Role: user.Role,
      }),
    };
  }
}
