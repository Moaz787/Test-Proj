import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../../DTOs/updateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../Entities/users.entity';
import { CommonService } from '../../../common/common.service';

@Injectable()
export class UpdateUserProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly commonService: CommonService,
  ) {}

  async updateProfile(
    id: string,
    updaterId: string,
    data: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    let user = await this.usersRepository.findOne({ where: { id } });
    const updater = await this.usersRepository.findOne({
      where: { id: updaterId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.commonService.CheckIfUserLoggedInAndVerified(user, updater);

    await this.commonService.UpdateRole(id, updaterId, user, updater);

    if (data.username) {
      user.username = data.username;
    } else {
      user.username = user.username;
    }

    if (file) {
      if (typeof user.ProfileImage === 'string') {
        try {
          await this.commonService.deleteImage(
            user.ProfileImage.split('/').pop(),
            'ProfileImages',
          );
        } catch (error) {
          return { error: 'Error deleting image' };
        }
      }

      let imagePath;
      try {
        imagePath = await this.commonService.processImage(
          'ProfileImages',
          file,
          user.username,
        );
      } catch (error) {
        return { error: 'Error processing image' };
      }
      if (typeof imagePath === 'string') user.ProfileImage = imagePath;
      else return imagePath;
    }

    user = await this.usersRepository.save(user);
    return { message: 'Profile updated successfully' };
  }
}
